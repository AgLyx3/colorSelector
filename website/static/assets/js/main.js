document.querySelector('button[type="submit"]').addEventListener('click', function(e) {
  e.preventDefault();

  const selectedColors = Array.from(document.querySelectorAll('input[name="colorSelector"]:checked'))
      .map(input => input.value);
  
  const selectedThemes = Array.from(document.querySelectorAll('input[name="themeSelector"]:checked'))
      .map(input => input.value);
  
  const customizeReq = document.getElementById('customize').value;
  

  const data = {
      colors: selectedColors,
      themes: selectedThemes,
      requirements: customizeReq
  };

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

function displayPalette(colors) {
  const colorBar = document.getElementById('colorBar');
  colorBar.innerHTML = '';
  
  const paletteContainer = document.createElement('div');
  paletteContainer.className = 'd-flex justify-content-center flex-wrap';

  const getLuminance = (r, g, b) => {
    let [rs, gs, bs] = [r/255, g/255, b/255].map(c => 
      c <= 0.03928 ? c/12.92 : Math.pow((c + 0.055)/1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (l1, l2) => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const colorBoxes = colors.map((color, index) => {
    const colorBoxWrapper = document.createElement('div');
    colorBoxWrapper.className = 'color-box-wrapper m-2';
    
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = color;

    const hexLabel = document.createElement('div');
    hexLabel.className = 'hex-label';
    hexLabel.textContent = color.toUpperCase();
    
    const contrastIcon = document.createElement('div');
    contrastIcon.className = 'contrast-icon mt-2';
    contrastIcon.style.display = 'none';
    
    colorBox.appendChild(hexLabel);
    colorBoxWrapper.appendChild(colorBox);
    colorBoxWrapper.appendChild(contrastIcon);
    
    return colorBoxWrapper;
  });

  colorBoxes.forEach((colorBoxWrapper, index) => {
    const currentColor = colors[index];
    const rgb1 = hexToRgb(currentColor);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    
    colorBoxWrapper.addEventListener('mouseenter', () => {
      colorBoxes.forEach((otherWrapper, otherIndex) => {
        if (index !== otherIndex) {
          const otherColor = colors[otherIndex];
          const rgb2 = hexToRgb(otherColor);
          const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
          const contrast = getContrastRatio(lum1, lum2);
          
          if (contrast >= 4.5) {
            const icon = otherWrapper.querySelector('.contrast-icon');
            icon.innerHTML = '✓';
            icon.style.color = '#000000';
            icon.title = `Good contrast with ${currentColor}`;
            icon.style.display = 'block';
          }
        }
      });
    });
    
    colorBoxWrapper.addEventListener('mouseleave', () => {
      colorBoxes.forEach((otherWrapper, otherIndex) => {
        if (index !== otherIndex) {
          const icon = otherWrapper.querySelector('.contrast-icon');
          icon.style.display = 'none';
          icon.innerHTML = '';
        }
      });
    });
    
    paletteContainer.appendChild(colorBoxWrapper);
  });
  
  colorBar.appendChild(paletteContainer);
}
