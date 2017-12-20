require.config({
    baseUrl: 'lib',
    paths: {        
        'domReady': 'domReady/domReady',
        'jquery': "jquery/dist/jquery",        
        'bootstrap': "bootstrap/dist/js/bootstrap",        
        'jquery.validate': 'jquery-validation/dist/jquery.validate',
        'additional-methods': 'jquery-validation/dist/additional-methods',
        'jquery.validate.unobtrusive': 'jquery-validation-unobtrusive/jquery.validate.unobtrusive'
    },    
    shim: {
        'toolkit': ["jquery"],
        'jquery.validate': ['jquery'],
        'jquery.validate.unobtrusive': ['jquery.validate']        
    }
});