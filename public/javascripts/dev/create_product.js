var createForm = document.getElementById("create-product-form");

createForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var els = e.target.elements;
    var result = {};
    for (var i = 0; i < els.length; i++) {
        result[els[i].name] = els[i].value;
    }

    var data = {
        name: result.name,
        price: result.price,
        category: {
            type: result.category
        }
    };
    var jsonData = JSON.stringify(data);

    $.ajax({
        url: "/products/create",
        type: "POST",
        data: jsonData,
        contentType: "application/json",
        success: function (result) {
            if (result.redirect) {
                window.location = result.redirect;
            } else {
                console.log('error: ' + result);
            }
        },
        error: function (xhr, status, error) {
            console.log('error: ' + xhr.responseText);
            $('#errors').text(JSON.parse(xhr.responseText).errors.join(', '));
        }
    });
});