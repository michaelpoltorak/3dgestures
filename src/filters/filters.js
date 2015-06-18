window.filters = (function (window) {
    console.log("filters init...");
    return {
        foo: function () {
            console.log("foo");
        }
    }
})(window);
