"""
Filename:
    test__init__.py
"""
from website import create_app
def test_default_config():
    """Test configuration"""
    app = create_app()
    assert 'SECRET_KEY' in app.config
    assert 'GEMINI_API_KEY' in app.config
