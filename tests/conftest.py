"""
Filename:
    conftest.py
"""
import pytest
from website import create_app

@pytest.fixture
def app():
    """Create and configure a test Flask application"""
    app = create_app({
        'TESTING': True,
        'SECRET_KEY': 'test_secret_key',
        'GEMINI_API_KEY': 'test_google_key'
    })
    with app.app_context():
        yield app

@pytest.fixture
def client(app):
    """Create a test client for the app"""
    return app.test_client()
