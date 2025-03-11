"""
Filename:
    views.py
"""
import os
from flask import Blueprint, render_template, request, jsonify
import google.generativeai as genai

# Create a blueprint
main_blueprint = Blueprint('main', __name__)
GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

@main_blueprint.route('/', methods=['GET', 'POST'])
def index():
    """
    Render the index page.
    """

    return render_template('index.html')

@main_blueprint.route('/get_recipes', methods=['POST'])
def get_recipes():
    """
    Handle the recipe generation request.
    """
    try:
        data = request.get_json()
        ingredients = data.get('ingredients')
        if not ingredients:
            raise Exception('No ingredients provided.')

        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""Create a recipe with {ingredients}. 
        Format the response in HTML using these rules:
        - Use <h1> for the recipe title
        - Use <h2> for section headings
        - Use <ul> and <li> for ingredient lists
        - Use <ol> and <li> for instructions
        - Use <strong> for bold text
        - Use <p> for paragraphs
        - Use <div class="section"> to wrap each major section
        """
        response = model.generate_content(prompt)
        recipe_html = response.text
        recipe_html = recipe_html.replace('```html', '')
        recipe_html = recipe_html.replace('```', '')

        return jsonify({
            'success': True,
            'recipe': recipe_html
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
