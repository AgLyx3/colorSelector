"""
Filename:
    test_views.py
"""
def test_index_route(client):
    """Test if the index page loads successfully."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"<!DOCTYPE html>" in response.data  # Ensure HTML content is returned

def test_get_recipes_success(client, mocker):
    """Test the /get_recipes endpoint with valid ingredients."""
    mock_model = mocker.patch("website.views.genai.GenerativeModel")
    mock_instance = mock_model.return_value
    mock_instance.generate_content.return_value.text = (
        "<h1>Sample Recipe</h1>"
        '<div class="section"><h2>Ingredients</h2><ul><li>Tomato</li></ul></div>'
    )

    response = client.post("/get_recipes", json={"ingredients": "tomato"})

    assert response.status_code == 200
    assert response.json["success"] is True
    assert "<h1>Sample Recipe</h1>" in response.json["recipe"]

def test_get_recipes_error(client, mocker):
    """Test the /get_recipes endpoint when an API error occurs."""
    mock_model = mocker.patch("website.views.genai.GenerativeModel")
    mock_model.return_value.generate_content.side_effect = Exception("API Error")

    response = client.post("/get_recipes", json={"ingredients": "tomato"})

    assert response.status_code == 400
    assert response.json["success"] is False
    assert "API Error" in response.json["error"]
