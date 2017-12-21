(function () {
    'use strict';
    angular.module('ngTimeSlider', [])
        .constant('$', window.$)
        .directive('ngTimeSlider', ngTimeSlider);

    ngTimeSlider.$inject = ['$', '$rootScope'];

    function ngTimeSlider($, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                startAt: '=',
                cells: '=',
                cellPrefixLabel: '@'
            },

            link: function (scope, $element, attr) {

                var timeSliderId = '#' + attr.id;
                scope.$watch('startAt', function (startAt) {
                    $(timeSliderId).TimeSlider({
                        start_timestamp: startAt
                    });
                }, true);

                scope.$watch('cells', function (cells) {
                    $(timeSliderId).TimeSlider('remove_all');
                    cells.forEach(function (cell) {
                        $(timeSliderId).TimeSlider('add', cell);
                    });
                }, true);

                $(timeSliderId).TimeSlider({
                    init_cells: null,
                    current_timestamp: null,
                    hours_per_ruler: 26,
                    cell_draggable: false,
                    ruler_draggable: false,
                    start_timestamp: scope.startAt,
                    cell_prefix_label: scope.cellPrefixLabel,
                    show_secs: false,
                    show_date_on_ruler: false,

                    on_click_timecell_callback: function (id) {
                        $rootScope.$broadcast('event:cell-clicked', { id: id });
                    }
                });
            }
        };
    }
})();