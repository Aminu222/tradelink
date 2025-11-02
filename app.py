from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from datetime import datetime
import os
from dotenv import load_dotenv
import bcrypt
import jwt
from functools import wraps
from websocket_service import init_socketio, socketio

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize SocketIO
init_socketio(app)

# Import and register routes blueprint at the end
def register_blueprints():
    from routes import routes_bp
    app.register_blueprint(routes_bp)

register_blueprints()

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 