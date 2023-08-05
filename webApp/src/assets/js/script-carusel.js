function initCarousel() {

    $(document).ready(function() {
        $("#menuMovil").css('visibility', 'hidden');

    });




    var click = 1;

    let showHidden = () => {
        let stateMenu = document.querySelector('#menuMovil');
        stateMenu.classList.toggle("show-menu");
    }


    // http://jsfiddle.net/s8w0r2qa/
    // $(document).ready(function () {

    //     $("#btnMO").on("click", function () {

    //         if ($("#menuMovil").hasClass("visible")) {
    //             $("#menuMovil").removeClass("visible");
    //         } else {
    //             $("#menuMovil").addClass("visible");
    //         }

    //     });

    // });


    // $(document).ready(function () {

    //     $("#search-icon").on("click", function () {

    //         if ($("#display-search").hasClass("visible")) {
    //             $("#display-search").removeClass("visible");
    //         } else {
    //             $("#display-search").addClass("visible");
    //         }

    //     });

    // });



    function changeIcoon(id) {
        let heard = document.getElementById(id);


        if (heard.classList == 'posicion-botonLike') {
            $('#' + id).html('<i class="fas fa-heart inclinacion-botonlike" class="animate__animated animate__pulse" style="color: red;"></i>');
            heard.classList.remove('posicion-botonLike');
            heard.classList.add('posicion-botonLike2');
            alert(`el id ${id} se agrego a favotitos`);
        } else if (heard.classList == 'posicion-botonLike2') {
            $('#' + id).html('<i class="far fa-heart inclinacion-botonlike" class="animate__animated animate__pulse"></i>');
            heard.classList.remove('posicion-botonLike2');
            heard.classList.add('posicion-botonLike');
            alert(`el id ${id} se elimino a favotitos`);
        }

    }

    // let btnSuma = document.querySelector('#btnsuma');
    // let input = document.querySelector('#input');
    // let btnResta = document.querySelector('#btnresta');

    // btnSuma.addEventListener('click', () => {
    //     input.value = parseInt(input, value) + 1;
    // });

    // btnresta.addEventListener('click', () => {
    //     input.value = parseInt(input, value) - 1;
    // });


    function addCart() {
        let cantCarrito = document.getElementById('cant-carrito');
        cantCarrito.value++;
    }

    function removeCart() {
        let cantCarrito = document.getElementById('cant-carrito');
        cantCarrito.value--;

        if (cantCarrito.value <= 0) {
            alert('No puedes agregar menos de un articulo en el carrito')
            cantCarrito.value = 1;
        }
    }

    // range

    // sliderlateral
    $(document).ready(function() {
        var fixHeight = function() {
            $('.navbar-nav').css(
                'max-height',
                document.documentElement.clientHeight - 150
            );
        };
        fixHeight();
        $(window).resize(function() {
            fixHeight();
        });
        $('.navbar .navbar-toggler').on('click', function() {
            fixHeight();
        });
        $('.navbar-toggler, .overlay').on('click', function() {
            $('.mobileMenu, .overlay').toggleClass('open');
        });
    });


}