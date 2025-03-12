"""
Filename:
    views.py
"""
import os
import re
from flask import Blueprint, render_template, request, jsonify
import google.generativeai as genai

# Create a blueprint
main_blueprint = Blueprint('main', __name__)
GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def extract_colors(text):
    """
    Extract hexadecimal color codes from a string.
    """
    if not isinstance(text, str):  
        text = str(text)
    pattern = r'#[0-9A-Fa-f]{6}'
    colors = re.findall(pattern, text)
    return colors

@main_blueprint.route('/', methods=['GET', 'POST'])
def index():
    """
    Render the index page.
    """

    return render_template('index.html')

@main_blueprint.route('/generate_palette', methods=['POST'])
def generate_palette():
    """
    Generate a color palette based on user inputs.
    """
    data = request.json
    selected_colors = data.get('colors', [])
    selected_themes = data.get('themes', [])
    requirements = data.get('requirements', '')
    print(selected_colors)
    print(selected_themes)
    print(requirements)

    if not selected_colors and not selected_themes and not requirements:
            raise Exception('Please provide at least one color, theme, or requirement.')

    model = genai.GenerativeModel('gemini-2.0-flash')
    prompt = f"""Create a cohesive color palette with at most 8 colors based on the following inputs:
    - Base Colors: {selected_colors if selected_colors else 'None provided'}
    - Themes: {selected_themes if selected_themes else 'None provided'}
    - Additional Requirements: {requirements if requirements else 'None provided'}

    Rules for the palette:
    1. For each provided base color, generate multiple variations including:
       - Lighter and darker shades
       - Slightly different hues
       - Gradient-friendly variations
    2. Consider the theme and additional requirements in color selection
    3. Ensure good contrast and harmony between colors for UI design

    Example format: ['#FF0000', '#00FF00', '#0000FF']
    """
    response = model.generate_content(prompt)
    colors = list(set(extract_colors(response.text)))
    print(colors)

    return jsonify({
        'status': 'success',
        'palette': colors
    })