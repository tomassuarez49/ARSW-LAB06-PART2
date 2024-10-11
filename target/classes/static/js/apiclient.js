var apiclient = (function () {

    // Función para obtener blueprints por autor
    var getBlueprintsByAuthor = function (authorName, callback) {
        $.getJSON("http://localhost:8080/blueprints/" + authorName, function (data) {
            // Aquí se espera que el API REST retorne un array de blueprints
            callback(data);
        }).fail(function () {
            console.error("Error fetching blueprints for author:", authorName);
            callback([]);
        });
    };

    var getBlueprintsByNameAndAuthor = function(authorName, bpName, callback) {
        $.getJSON("http://localhost:8080/blueprints/" + authorName + "/" + bpName, function(data) {
            console.log("Data received from server:", data);
    
            if (Array.isArray(data) && data.length > 0) {
                data = data[0]; // Extraer el primer elemento del array
            }
    
            var transformedData = {
                author: data.author,
                name: data.name,
                points: data.points.map(function(point) {
                    return { x: point.x, y: point.y };
                })
            };
    
            console.log("Final transformed data:", transformedData);
            callback(transformedData);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error fetching data: ", textStatus, errorThrown);
        });
    };

    var updateBlueprint = function(authorName, bpName, blueprintData) {
        return $.ajax({
            url: `http://localhost:8080/blueprints/${authorName}/${bpName}`,
            type: 'PUT',
            data: JSON.stringify(blueprintData),
            contentType: "application/json"
        });
    };

    var createBlueprint = function(blueprintData) {
        return $.ajax({
            url: `http://localhost:8080/blueprints/create`,
            type: 'POST',
            data: JSON.stringify(blueprintData),
            contentType: "application/json"
        });
    };

    var deleteBlueprint = function(authorName, bpName) {
        return $.ajax({
            url: `http://localhost:8080/blueprints/${authorName}/${bpName}`,
            type: 'DELETE',
            contentType: "application/json"
        });
    };
    
    
    
    return {
        getBlueprintsByAuthor: getBlueprintsByAuthor,
        getBlueprintsByNameAndAuthor: getBlueprintsByNameAndAuthor,
        updateBlueprint: updateBlueprint,
        createBlueprint: createBlueprint,
        deleteBlueprint: deleteBlueprint
    };

})();
