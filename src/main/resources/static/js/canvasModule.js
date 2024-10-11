var canvasModule = (function() {
    var _canvas;
    var _ctx;

    // Inicializa el canvas y los eventos del puntero
    var initializeCanvas = function(canvasId) {
        _canvas = document.getElementById(canvasId);
        if (!_canvas) {
            console.error("Canvas element not found");
            return;
        }
        _ctx = _canvas.getContext("2d");
        _initPointerEvents();
    };

    // Añadir los eventos del puntero
    var _initPointerEvents = function() {
        if (window.PointerEvent) {
            _canvas.addEventListener("pointerdown", function(event) {
                if (app.getCurrentBlueprint()) {
                    _addPointer(event);
                } else {
                    console.warn("No blueprint selected. Cannot draw on canvas.");
                }
            });
        } else {
            // Fallback para navegadores que no soportan PointerEvent
            _canvas.addEventListener("mousedown", function(event) {
                if (app.getCurrentBlueprint()) {
                    _addPointer(event);
                } else {
                    console.warn("No blueprint selected. Cannot draw on canvas.");
                }
            });
            _canvas.addEventListener("touchstart", function(event) {
                if (app.getCurrentBlueprint()) {
                    _addPointer(event.touches[0]);
                } else {
                    console.warn("No blueprint selected. Cannot draw on canvas.");
                }
            });
        }
    };

    // Captura la posición del clic/touch y guarda los puntos
    var _addPointer = function(event) {
        var rect = _canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Agregar punto al plano actual
        var currentBlueprint = app.getCurrentBlueprint();
        currentBlueprint.points.push({ x: x, y: y });

        drawCanvas(currentBlueprint.points);
    };

    // Dibuja los puntos capturados en el canvas
    var drawCanvas = function(points) {
        if (!_canvas || !_ctx) {
            console.error("Canvas or context is not initialized");
            return;
        }

        _ctx.clearRect(0, 0, _canvas.width, _canvas.height); // Limpiar canvas
        if (points.length > 0) {
            _ctx.beginPath();
            _ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                _ctx.lineTo(points[i].x, points[i].y);
            }
            _ctx.stroke();
        }
    };

    return {
        initialize: initializeCanvas,
        drawCanvas: drawCanvas, // Exponer la función drawCanvas correctamente
        clearCanvas: function() {
            if (!_canvas) {
                console.error("Canvas is not initialized");
                return;
            }
            _ctx.clearRect(0, 0, _canvas.width, _canvas.height); // Limpiar canvas
        }
    };
})();
