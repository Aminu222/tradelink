from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import jwt
import os
from db import get_db_connection
from datetime import datetime
import json

socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode='threading',  # Use threading mode for better compatibility
    logger=True,
    engineio_logger=True
)

# Store connected users
connected_users = {}

def init_socketio(app):
    """Initialize SocketIO with the Flask app"""
    socketio.init_app(
        app, 
        cors_allowed_origins="*",
        async_mode='threading',  # Use threading mode for better compatibility
        logger=True,
        engineio_logger=True
    )

def get_user_from_token(token):
    """Extract user information from JWT token"""
    try:
        data = jwt.decode(token, os.getenv('SECRET_KEY', 'your-secret-key-here'), algorithms=['HS256'])
        user_id = data['user_id']
        
        # Get user details from database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id, username, email, user_type, first_name, last_name, company_name FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return user
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None

@socketio.on('connect')
def handle_connect(auth=None):
    """Handle client connection"""
    print(f"Client connected: {request.sid}")

    token = None
    if auth and 'token' in auth:
        token = auth['token']
    else:
        # fallback for legacy clients
        token = request.args.get('token') or request.headers.get('Authorization', '').replace('Bearer ', '')

    if token:
        user = get_user_from_token(token)
        if user:
            # Store user connection
            connected_users[request.sid] = {
                'user_id': user['id'],
                'username': user['username'],
                'user_type': user['user_type'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'company_name': user['company_name']
            }
            # Join user-specific room
            join_room(f"user_{user['id']}")
            # Join role-specific room
            join_room(f"role_{user['user_type']}")
            # If admin, join admin room
            if user['user_type'] == 'admin':
                join_room('admin')
            print(f"User {user['username']} connected and joined rooms")
            # Emit connection confirmation
            emit('connection_confirmed', {
                'user_id': user['id'],
                'username': user['username'],
                'user_type': user['user_type']
            })
            return
        else:
            emit('error', {'message': 'Invalid token'})
            return False
    else:
        emit('error', {'message': 'No token provided'})
        return False

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")
    
    if request.sid in connected_users:
        user = connected_users[request.sid]
        print(f"User {user['username']} disconnected")
        del connected_users[request.sid]

@socketio.on('join_conversation')
def handle_join_conversation(data):
    """Join a specific conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id:
        join_room(f"conversation_{conversation_id}")
        print(f"User joined conversation {conversation_id}")

@socketio.on('leave_conversation')
def handle_leave_conversation(data):
    """Leave a specific conversation room"""
    conversation_id = data.get('conversation_id')
    if conversation_id:
        leave_room(f"conversation_{conversation_id}")
        print(f"User left conversation {conversation_id}")

@socketio.on('send_message')
def handle_send_message(data):
    """Handle sending a new message"""
    if request.sid not in connected_users:
        emit('error', {'message': 'Not authenticated'})
        return
    
    user = connected_users[request.sid]
    conversation_id = data.get('conversation_id')
    message_text = data.get('message')
    inquiry_id = data.get('inquiry_id')
    
    if not message_text or not inquiry_id:
        emit('error', {'message': 'Missing message or inquiry_id'})
        return
    
    try:
        # Save message to database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('''
            INSERT INTO messages (inquiry_id, sender_id, message, is_read, created_at)
            VALUES (%s, %s, %s, %s, %s)
        ''', (inquiry_id, user['user_id'], message_text, False, datetime.utcnow()))
        
        message_id = cursor.lastrowid
        
        # Get the inquiry details
        cursor.execute('''
            SELECT i.*, p.name as product_name, p.producer_id as producer_id,
                   buyer.username as buyer_username, buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name,
                   producer.username as producer_username, producer.first_name as producer_first_name, producer.last_name as producer_last_name
            FROM inquiries i
            JOIN products p ON i.product_id = p.id
            JOIN users buyer ON i.buyer_id = buyer.id
            JOIN users producer ON p.producer_id = producer.id
            WHERE i.id = %s
        ''', (inquiry_id,))
        
        inquiry = cursor.fetchone()
        
        # Mark messages as read for the sender
        cursor.execute('''
            UPDATE messages 
            SET is_read = TRUE 
            WHERE inquiry_id = %s AND sender_id != %s
        ''', (inquiry_id, user['user_id']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Prepare message data
        message_data = {
            'id': message_id,
            'inquiry_id': inquiry_id,
            'sender_id': user['user_id'],
            'sender_name': f"{user['first_name']} {user['last_name']}",
            'sender_username': user['username'],
            'sender_type': user['user_type'],
            'message': message_text,
            'is_read': False,
            'created_at': datetime.utcnow().isoformat(),
            'product_name': inquiry['product_name'],
            'buyer_name': f"{inquiry['buyer_first_name']} {inquiry['buyer_last_name']}",
            'producer_name': f"{inquiry['producer_first_name']} {inquiry['producer_last_name']}"
        }
        
        # Emit to conversation room
        socketio.emit('new_message', message_data, room=f"conversation_{inquiry_id}")
        
        # Emit to specific users involved in the conversation
        socketio.emit('new_message', message_data, room=f"user_{inquiry['buyer_id']}")
        socketio.emit('new_message', message_data, room=f"user_{inquiry['producer_id']}")
        
        # Emit to admin room
        socketio.emit('new_message', message_data, room='admin')
        
        # Send confirmation to sender
        emit('message_sent', {
            'message_id': message_id,
            'status': 'sent'
        })
        
        print(f"Message sent by {user['username']} in inquiry {inquiry_id}")
        
    except Exception as e:
        print(f"Error sending message: {e}")
        emit('error', {'message': 'Failed to send message'})

@socketio.on('mark_read')
def handle_mark_read(data):
    """Mark messages as read"""
    if request.sid not in connected_users:
        emit('error', {'message': 'Not authenticated'})
        return
    
    user = connected_users[request.sid]
    inquiry_id = data.get('inquiry_id')
    
    if not inquiry_id:
        emit('error', {'message': 'Missing inquiry_id'})
        return
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Mark all messages in this inquiry as read for this user
        cursor.execute('''
            UPDATE messages 
            SET is_read = TRUE 
            WHERE inquiry_id = %s AND sender_id != %s
        ''', (inquiry_id, user['user_id']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Emit read status to conversation room
        socketio.emit('messages_read', {
            'inquiry_id': inquiry_id,
            'read_by': user['user_id'],
            'read_by_name': f"{user['first_name']} {user['last_name']}"
        }, room=f"conversation_{inquiry_id}")
        
        print(f"Messages marked as read by {user['username']} in inquiry {inquiry_id}")
        
    except Exception as e:
        print(f"Error marking messages as read: {e}")
        emit('error', {'message': 'Failed to mark messages as read'})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    if request.sid not in connected_users:
        return
    
    user = connected_users[request.sid]
    inquiry_id = data.get('inquiry_id')
    is_typing = data.get('is_typing', False)
    
    if inquiry_id:
        typing_data = {
            'inquiry_id': inquiry_id,
            'user_id': user['user_id'],
            'username': user['username'],
            'user_name': f"{user['first_name']} {user['last_name']}",
            'is_typing': is_typing
        }
        
        # Emit to conversation room (excluding sender)
        socketio.emit('user_typing', typing_data, room=f"conversation_{inquiry_id}", include_self=False)

@socketio.on('online_status')
def handle_online_status(data):
    """Handle online status updates"""
    if request.sid not in connected_users:
        return
    
    user = connected_users[request.sid]
    is_online = data.get('is_online', True)
    
    status_data = {
        'user_id': user['user_id'],
        'username': user['username'],
        'user_name': f"{user['first_name']} {user['last_name']}",
        'is_online': is_online,
        'last_seen': datetime.utcnow().isoformat() if not is_online else None
    }
    
    # Emit to role-specific rooms
    socketio.emit('user_status_change', status_data, room=f"role_{user['user_type']}")

def get_online_users():
    """Get list of currently online users"""
    return list(connected_users.values())

def send_notification_to_user(user_id, notification_data):
    """Send notification to specific user"""
    socketio.emit('notification', notification_data, room=f"user_{user_id}")

def send_notification_to_role(role, notification_data):
    """Send notification to all users of a specific role"""
    socketio.emit('notification', notification_data, room=f"role_{role}")

def send_admin_notification(notification_data):
    """Send notification to all admin users"""
    socketio.emit('admin_notification', notification_data, room='admin') 