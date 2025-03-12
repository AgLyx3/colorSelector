// Handle form submission
document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
  e.preventDefault();
  
  // Get selected colors
  const selectedColors = Array.from(document.querySelectorAll('input[name="colorSelector"]:checked'))
      .map(input => input.value);
  
  // Get selected themes
  const selectedThemes = Array.from(document.querySelectorAll('input[name="themeSelector"]:checked'))
      .map(input => input.value);
  
  // Get customize requirements
  const customizeReq = document.getElementById('customize').value;
  
  // Prepare data for submission
  const data = {
      colors: selectedColors,
      themes: selectedThemes,
      requirements: customizeReq
  };
  
  // Send data to backend
  fetch('/generate_palette', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      if (data.status === 'success' && data.palette) {
          displayPalette(data.palette);
      } else {
          throw new Error('Failed to generate palette');
      }
  })
  .catch(error => {
      console.error('Error:', error);
      document.getElementById('colorBar').innerHTML = 
          '<div class="alert alert-danger">Failed to generate palette. Please try again.</div>';
  });
});

// Function to display the palette
function displayPalette(colors) {
  const colorBar = document.getElementById('colorBar');
  colorBar.innerHTML = '';
  
  // Create container for colors
  const paletteContainer = document.createElement('div');
  paletteContainer.className = 'd-flex justify-content-center flex-wrap';
  
  // Helper function to calculate relative luminance
  const getLuminance = (r, g, b) => {
    let [rs, gs, bs] = [r/255, g/255, b/255].map(c => 
      c <= 0.03928 ? c/12.92 : Math.pow((c + 0.055)/1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Helper function to calculate contrast ratio
  const getContrastRatio = (l1, l2) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Create all color boxes first
  const colorBoxes = colors.map((color, index) => {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box m-2';
    colorBox.style.backgroundColor = color;
    
    // Add hex code label
    const hexLabel = document.createElement('div');
    hexLabel.className = 'hex-label';
    hexLabel.textContent = color.toUpperCase();
    
    // Add contrast icon container at the bottom of the color box
    const contrastIcon = document.createElement('div');
    contrastIcon.className = 'contrast-icon mt-2'; // Changed ms-2 to mt-2 for margin-top instead of margin-left
    contrastIcon.style.display = 'none';
    
    colorBox.appendChild(hexLabel);
    colorBox.appendChild(contrastIcon);
    
    return colorBox;
  });

  // Add hover events and calculate contrasts
  colorBoxes.forEach((colorBox, index) => {
    const currentColor = colors[index];
    const rgb1 = hexToRgb(currentColor);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    
    colorBox.addEventListener('mouseenter', () => {
      colorBoxes.forEach((otherBox, otherIndex) => {
        if (index !== otherIndex) {
          const otherColor = colors[otherIndex];
          const rgb2 = hexToRgb(otherColor);
          const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          const contrast = getContrastRatio(lum1, lum2);
          
          if (contrast >= 4.5) { // WCAG AA standard for normal text
            const icon = otherBox.querySelector('.contrast-icon');
            icon.innerHTML = '✓';
            icon.style.color = '#00FF00';
            icon.title = `Good contrast with ${currentColor}`;
            icon.style.display = 'block';
          }
        }
      });
    });
    
    colorBox.addEventListener('mouseleave', () => {
      colorBoxes.forEach((otherBox, otherIndex) => {
        if (index !== otherIndex) {
          const icon = otherBox.querySelector('.contrast-icon');
          icon.style.display = 'none';
          icon.innerHTML = '';
        }
      });
    });
    
    paletteContainer.appendChild(colorBox);
  });
  
  colorBar.appendChild(paletteContainer);
}
