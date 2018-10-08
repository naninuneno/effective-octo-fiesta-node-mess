var logoutBtn = document.getElementById("logout");

logoutBtn.addEventListener("click", function () {
    $.ajax({
        url: "/api/users/logout",
        type: "POST",
        contentType: "application/json",
        success: function() {
            console.log("Logging out");
            window.location.replace("/login");
        },
        error: function(xhr, status, error) {
            console.log("error: " + xhr.responseText);
        }
    });
});