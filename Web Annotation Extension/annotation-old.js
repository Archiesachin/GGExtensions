(function() {
    if (document.getElementById('annotationSidebar')) return;

    // Add Sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'annotationSidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '10px';
    sidebar.style.left = '10px';
    sidebar.style.width = '200px';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.zIndex = '10000';
    sidebar.style.padding = '10px';
    sidebar.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.display = 'none';
    document.body.appendChild(sidebar);

    sidebar.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Tools</span>
            <button id="closeSidebar" style="background: transparent; border: none; font-size: 16px; cursor: pointer;">✖</button>
        </div>
        <button id="startAnnotation" style="border-radius: 8px">Start Annotation</button>
        <button id="stopAnnotation" style="display: none;border-radius: 8px">Stop Annotation</button>
        <button id="screenshotButton" style="border-radius: 8px">Annotation Screenshot</button>
        <button id="clearButton" style="border-radius: 8px">Clear Annotations</button>
    `;

    const startAnnotationButton = document.getElementById('startAnnotation');
    const stopAnnotationButton = document.getElementById('stopAnnotation');
    const screenshotButton = document.getElementById('screenshotButton');
    const clearButton = document.getElementById('clearButton');
    const closeSidebarButton = document.getElementById('closeSidebar');

    // Annotation Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'annotationCanvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9999';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let penColor = '#000000';
    let penWidth = 2;
    const paths = [];
    let currentPath = [];

    const penWidthInput = document.createElement('input');
    penWidthInput.type = 'range';
    penWidthInput.min = 1;
    penWidthInput.max = 20;
    penWidthInput.value = 2;
    penWidthInput.style.display = 'none';
    sidebar.appendChild(penWidthInput);

    const colorPickerInput = document.createElement('input');
    colorPickerInput.type = 'color';
    colorPickerInput.value = '#000000';
    colorPickerInput.style.display = 'none';
    sidebar.appendChild(colorPickerInput);

    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo';
    undoButton.style.display = 'none';
    sidebar.appendChild(undoButton);

    penWidthInput.addEventListener('input', (e) => {
        penWidth = e.target.value;
    });

    colorPickerInput.addEventListener('input', (e) => {
        penColor = e.target.value;
    });

    startAnnotationButton.addEventListener('click', () => {
        canvas.style.display = 'block';
        canvas.style.cursor = 'crosshair';
        startAnnotationButton.style.display = 'none';
        stopAnnotationButton.style.display = 'inline';
        penWidthInput.style.display = 'block';
        colorPickerInput.style.display = 'block';
        undoButton.style.display = 'block';
        clearButton.style.display = 'block';
    });

    stopAnnotationButton.addEventListener('click', () => {
        canvas.style.display = 'none';
        canvas.style.cursor = 'default';
        startAnnotationButton.style.display = 'inline';
        stopAnnotationButton.style.display = 'none';
        penWidthInput.style.display = 'none';
        colorPickerInput.style.display = 'none';
        undoButton.style.display = 'none';
        clearButton.style.display = 'none';
    });

    undoButton.addEventListener('click', () => {
        paths.pop();
        redraw();
    });

    closeSidebarButton.addEventListener('click', () => {
        sidebar.style.display = 'none';
    });

    clearButton.addEventListener('click', () => {
        paths.length = 0;
        redraw();
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.target.id === 'annotationCanvas') {
            drawing = true;
            currentPath = [{ x: e.clientX, y: e.clientY, color: penColor, width: penWidth }];
            ctx.beginPath();
            ctx.moveTo(e.clientX, e.clientY);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) {
            currentPath.push({ x: e.clientX, y: e.clientY, color: penColor, width: penWidth });
            ctx.lineTo(e.clientX, e.clientY);
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (drawing) {
            paths.push(currentPath);
            drawing = false;
            ctx.closePath();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (drawing) {
            paths.push(currentPath);
            drawing = false;
            ctx.closePath();
        }
    });

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths.forEach(path => {
            ctx.beginPath();
            path.forEach((point, index) => {
                ctx.strokeStyle = point.color;
                ctx.lineWidth = point.width;
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.stroke();
            });
            ctx.closePath();
        });
    }

    screenshotButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'screenshot.png';
        link.click();
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleSidebar') {
            sidebar.style.display = (sidebar.style.display === 'none' || sidebar.style.display === '') ? 'flex' : 'none';
        }
    });

})();



/* (function() {
    if (document.getElementById('annotationSidebar')) return;

    // Add Sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'annotationSidebar';
    sidebar.classList.add('collapsed');
    sidebar.style.position = 'fixed';
    sidebar.style.top = '10px';
    sidebar.style.left = '10px';
    sidebar.style.width = '150px';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.zIndex = '10000';
    sidebar.style.padding = '10px';
    sidebar.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    document.body.appendChild(sidebar);

    sidebar.innerHTML = `
        <div id="dragHandle" style="cursor: grab; padding: 5px; background: #007bff; color: white; border-radius: 50%; width: 100%; text-align: center;">☰</div>
        <div id="tools" style="display: none;">
            <label for="penWidth">Pen Width:</label>
            <input type="range" id="penWidth" min="1" max="20" value="2"><br><br>
            <label for="colorPicker">Color:</label>
            <input type="color" id="colorPicker" value="#000000"><br><br>
            <button id="undoButton">Undo</button>
            <button id="startAnnotation">Start Annotation</button>
            <button id="stopAnnotation" style="display: none;">Stop Annotation</button>
        </div>
    `;

    const dragHandle = document.getElementById('dragHandle');
    const toolsDiv = document.getElementById('tools');
    const startAnnotationButton = document.getElementById('startAnnotation');
    const stopAnnotationButton = document.getElementById('stopAnnotation');
    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragHandle.style.cursor = 'grabbing';
        offsetX = e.clientX - sidebar.getBoundingClientRect().left;
        offsetY = e.clientY - sidebar.getBoundingClientRect().top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });

    function onDrag(e) {
        if (isDragging) {
            sidebar.style.left = `${e.clientX - offsetX}px`;
            sidebar.style.top = `${e.clientY - offsetY}px`;
        }
    }

    function onStopDrag() {
        isDragging = false;
        dragHandle.style.cursor = 'grab';
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);
    }

    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('expanded');
        sidebar.classList.toggle('collapsed');
        if (sidebar.classList.contains('expanded')) {
            toolsDiv.style.display = 'block';
        } else {
            toolsDiv.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('expanded') && !e.target.closest('#annotationSidebar')) {
            sidebar.classList.remove('expanded');
            sidebar.classList.add('collapsed');
            toolsDiv.style.display = 'none';
        }
    });

    // Prevent annotation on the sidebar
    sidebar.addEventListener('mousedown', (e) => e.stopPropagation());
    sidebar.addEventListener('mousemove', (e) => e.stopPropagation());
    sidebar.addEventListener('mouseup', (e) => e.stopPropagation());

    // Annotation Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'annotationCanvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9999';
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let penColor = '#000000';
    let penWidth = 2;
    const paths = [];
    let currentPath = [];

    const penWidthInput = document.getElementById('penWidth');
    const colorPickerInput = document.getElementById('colorPicker');
    const undoButton = document.getElementById('undoButton');

    penWidthInput.addEventListener('input', (e) => {
        penWidth = e.target.value;
    });

    colorPickerInput.addEventListener('input', (e) => {
        penColor = e.target.value;
    });

    startAnnotationButton.addEventListener('click', () => {
        canvas.style.display = 'block';
        startAnnotationButton.style.display = 'none';
        stopAnnotationButton.style.display = 'inline';
    });

    stopAnnotationButton.addEventListener('click', () => {
        canvas.style.display = 'none';
        startAnnotationButton.style.display = 'inline';
        stopAnnotationButton.style.display = 'none';
    });

    undoButton.addEventListener('click', () => {
        paths.pop();
        redraw();
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.target.id === 'annotationCanvas') {
            drawing = true;
            currentPath = [{ x: e.clientX, y: e.clientY, color: penColor, width: penWidth }];
            ctx.beginPath();
            ctx.moveTo(e.clientX, e.clientY);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) {
            currentPath.push({ x: e.clientX, y: e.clientY, color: penColor, width: penWidth });
            ctx.lineTo(e.clientX, e.clientY);
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penWidth;
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (drawing) {
            paths.push(currentPath);
            drawing = false;
            ctx.closePath();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (drawing) {
            paths.push(currentPath);
            drawing = false;
            ctx.closePath();
        }
    });

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths.forEach(path => {
            ctx.beginPath();
            path.forEach((point, index) => {
                ctx.strokeStyle = point.color;
                ctx.lineWidth = point.width;
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.stroke();
            });
            ctx.closePath();
        });
    }
})();
 */