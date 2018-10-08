var loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var els = e.target.elements;
    var result = {};
    for (var i = 0; i < els.length; i++) {
        result[els[i].name] = els[i].value;
    }

    var data = { user: {
            email: result.email,
            password: result.password
        }
    };
    var jsonData = JSON.stringify(data);

    $.ajax({
        url: "/api/users/login",
        type: "POST",
        data: jsonData,
        contentType: "application/json",
        success: function(result) {
            const jsonResult = JSON.stringify(result);
            console.log("Success: " + jsonResult);
            window.location.replace("/");
        },
        error: function(xhr, status, error) {
            console.log("error: " + xhr.responseText);
            $('#errors').text(JSON.parse(xhr.responseText).errors.join(', '));
        }
    });
});