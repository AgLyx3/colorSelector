"""
Filename:
    test_views.py
"""
def test_index_route(client):
    """Test if the index page loads successfully."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"<!DOCTYPE html>" in response.data  # Ensure HTML content is returned

def test_get_palette_success(client, mocker):
    """Test the /get_palette endpoint with valid color."""
    mock_client = mocker.patch("website.views.genai.GenerativeModel")
    mock_instance = mock_client.return_value
    mock_instance.messages.create.return_value.content = (
        "[\"#FF5733\", \"#33FF57\", \"#5733FF\", \"#FF33F5\"]"
    )

    response = client.post("/get_palette", json={"color": "#FF0000"})

    assert response.status_code == 200
    assert response.json["success"] is True
    assert len(response.json["palette"]) == 4
    assert all(color.startswith("#") for color in response.json["palette"])

def test_get_palette_error(client, mocker):
    """Test the /get_palette endpoint when an API error occurs."""
    mock_client = mocker.patch("website.views.genai.GenerativeModel")
    mock_client.return_value.messages.create.side_effect = Exception("API Error")

    response = client.post("/get_palette", json={"color": "#FF0000"})

    assert response.status_code == 400
    assert response.json["success"] is False
    assert "API Error" in response.json["error"]
