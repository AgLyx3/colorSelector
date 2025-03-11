"""
Filename:
    __init__.py
"""
import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

def create_app(test_config=None):
    """
    Create and configure the Flask app.
    """
    app = Flask(__name__)

    if test_config is None:
        app.config.from_mapping(
            SECRET_KEY=os.getenv('SECRET_KEY'),
            GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
        )
    else:
        app.config.update(test_config)

    from .views import main_blueprint
    app.register_blueprint(main_blueprint)

    return app

if __name__ == '__main__':
    create_app()
