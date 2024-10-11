var useMockData = false;
var api = apiclient;

var app = (function(){
    var author_ = "";
    var blueprints_ = [];
    var currentBlueprint_ = null;

    var _displayError = function(message) {
        console.error(message);
        $("#error-message").text(message).show();
        setTimeout(() => $("#error-message").hide(), 3000);
    };

    var _clearCanvas = function() {
        canvasModule.clearCanvas(); // Usamos el método del módulo canvas para limpiar el canvas
    };

    return {
        changeAuthor: function(author) {
            if (!author) {
                _displayError("Author name cannot be empty");
                return;
            }
            author_ = author;
        },
        getBluePrintByName: function(name) {
            if (!name) {
                _displayError("Blueprint name is required");
                return;
            }
            var author = $("#search-author").val();
            if (!author) {
                _displayError("Author name is required");
                return;
            }
            api.getBlueprintsByNameAndAuthor(author, name, function(blueprint) {
                if (!blueprint || !blueprint.points || !Array.isArray(blueprint.points)) {
                    _displayError("Invalid blueprint data received");
                    return;
                }
                try {
                    // Limpiar canvas si se selecciona un blueprint diferente
                    if (!currentBlueprint_ || currentBlueprint_.name !== blueprint.name) {
                        _clearCanvas();
                        currentBlueprint_ = blueprint;
                    }

                    var points = blueprint.points;
                    // Dibujar puntos en el canvas usando canvasModule
                    canvasModule.drawCanvas(points);

                    $("#name-blueprint").text("Current Blueprint: " + blueprint.name);
                } catch (error) {
                    _displayError("Error drawing blueprint: " + error.message);
                }
            });
        },
        getBlueprints: function() {
            var author = $("#search-author").val();
            if (!author) {
                _displayError("Please enter an author name");
                return;
            }

            api.getBlueprintsByAuthor(author, function(data) {
                if (!data || !Array.isArray(data)) {
                    _displayError("No blueprints found or invalid data received");
                    return;
                }
                try {
                    blueprints_ = data.map(function(blueprint) {
                        if (!blueprint || !blueprint.points || !Array.isArray(blueprint.points)) {
                            throw new Error("Invalid blueprint format");
                        }
                        return {
                            name: blueprint.name,
                            npoints: blueprint.points.length
                        };
                    });
                    var $authorName = $("#author-name");
                    $authorName.text(author + "'s blueprints: ");
                    var $table = $("#blueprints-table");
                    var $tbody = $table.find("tbody");
                    $tbody.empty();
                    blueprints_.forEach(function(blueprint) {
                        var $row = $("<tr>");
                        $row.append($("<td>").text(blueprint.name));
                        $row.append($("<td>").text(blueprint.npoints));

                        var $button = $("<button>")
                            .text("Open")
                            .addClass("btn btn-info px-3")
                            .on("click", function() {
                                app.getBluePrintByName(blueprint.name);
                            });

                        $row.append($("<td>").append($button));
                        $tbody.append($row);
                    });

                    var totalPoints = blueprints_.reduce(function(count, blueprint) {
                        return count + blueprint.npoints;
                    }, 0);

                    $("#total-user-points").text("Total user points: " + totalPoints);
                } catch (error) {
                    _displayError("Error processing blueprints: " + error.message);
                    $("#blueprints-table tbody").empty();
                    $("#total-user-points").text("Error loading blueprints");
                }
            });
        },
        getCurrentAuthor: function() {
            return author_;
        },
        addPointToCurrentBlueprint: function(point) {
            if (!currentBlueprint_) {
                _displayError("No blueprint selected");
                return;
            }
            currentBlueprint_.points.push(point);
            console.log("Current blueprint updated:", currentBlueprint_);
            canvasModule.drawCanvas(currentBlueprint_.points);
        },
        getCurrentBlueprint: function() {
            return currentBlueprint_;
        },
        saveCurrentBlueprint: function() {
            if (!currentBlueprint_) {
                _displayError("No blueprint selected to save");
                return;
            }

            console.log("Saving blueprint:", currentBlueprint_);
            api.updateBlueprint(currentBlueprint_.author, currentBlueprint_.name, currentBlueprint_).then(function() {
                console.log("Blueprint saved successfully.");
                app.getBlueprints();
            }).catch(function(error) {
                _displayError("Error saving blueprint: " + error.message);
            });
        },
        createNewBlueprint: function() {
            _clearCanvas();
            var author = $("#search-author").val();
            if (!author) {
                _displayError("Please enter an author name");
                return;
            }
            var newBlueprintName = prompt("Enter the name for the new blueprint:");
            if (!newBlueprintName) {
                _displayError("Blueprint name cannot be empty");
                return;
            }
            currentBlueprint_ = {
                author: author,
                name: newBlueprintName,
                points: []
            };
            api.createBlueprint(currentBlueprint_).then(function() {
                console.log("Blueprint created successfully.");
                app.getBlueprints();
            }).catch(function(error) {
                _displayError("Error creating blueprint: " + error.message);
            });
            $("#name-blueprint").text("Current Blueprint: " + newBlueprintName);
        },

        deleteCurrentBlueprint: function() {
            if (!currentBlueprint_) {
                _displayError("No blueprint selected to delete");
                return;
            }
            
            api.deleteBlueprint(currentBlueprint_.author, currentBlueprint_.name).then(function() {
                console.log("Blueprint deleted successfully.");
                currentBlueprint_ = null; // Limpiar el blueprint actual
                _clearCanvas(); // Limpiar el canvas
                app.getBlueprints(); // Actualizar el listado de blueprints
            }).catch(function(error) {
                _displayError("Error deleting blueprint: " + error.message);
            });
        }
        
    };
})();

// Inicializar el módulo del canvas
$(document).ready(function() {
    canvasModule.initialize("canvas", app);
    $("#save-canvas").on("click", function() {
        app.saveCurrentBlueprint();
    });
    $("#create-canvas").on("click", function() {
        app.createNewBlueprint();
    });
    $("#delete").on("click", function() {
        app.deleteCurrentBlueprint();
    });
});