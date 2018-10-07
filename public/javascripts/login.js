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
    console.log("data: " + jsonData);

    $.ajax({
        url: "/api/users/login",
        type: "POST",
        data: jsonData,
        contentType: "application/json",
        success: function(result) {
            console.log("Success: " + JSON.stringify(result));
        },
        error: function(xhr, status, error) {
            console.log("error: " + xhr.responseText);
        }
    });
});