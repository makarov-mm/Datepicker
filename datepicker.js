Date.prototype.isLeapYear = function () {
    var y = this.getFullYear();
    return y % 4 == 0 && y % 100 != 0 || y % 400 == 0;
};

Date.prototype.getDaysInMonth = function () {
    return Date.prototype.getDaysInMonth[this.isLeapYear() ? 'L' : 'R'][this.getMonth()];
};

Date.prototype.getDaysInMonth.R = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Date.prototype.getDaysInMonth.L = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function prevMonth(datepicker) {
    var month = getMonth(datepicker);
    if (--month < 0) {
        month = 11;
        var year = getYear(datepicker);
        --year;
        setYear(datepicker, year, true);
    }
    setMonth(datepicker, month);

    return false;
}

function nextMonth(datepicker) {
    var month = getMonth(datepicker);
    if (++month > 11) {
        month = 0;
        var year = getYear(datepicker);
        ++year;
        setYear(datepicker, year, true);
    }
    setMonth(datepicker, month);

    return false;
}

function numberToMonth(num) {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][num];
}

function getYear(datepicker) {
    return parseInt(datepicker.find('input[type=hidden][name=year]').val(), 10);
}

function getMonth(datepicker) {
    return parseInt(datepicker.find('input[type=hidden][name=month]').val(), 10);
}

function getDay(datepicker) {
    return parseInt(datepicker.find('input[type=hidden][name=day]').val(), 10);
}

function getDate(datepicker) {
    return new Date(getYear(datepicker), getMonth(datepicker), getDay(datepicker));
}

function rebuildDatepicker(datepicker) {
    const header = datepicker.find('.datepicker-window-header');
    header.find('span').text(numberToMonth(getMonth(datepicker)) + ' ' + getYear(datepicker));

    const daysTable = datepicker.find('.datepicker-window-table');
    daysTable.empty();

    if (daysTable.length) {
        const date = new Date(getYear(datepicker), getMonth(datepicker), 1);
        const daysCount = date.getDaysInMonth();
        let dayOfWeek = date.getDay() - 1;

        if (dayOfWeek < 0) {
            dayOfWeek = 6;
        }

        let offset = dayOfWeek;
        let done = false;

        for (let j = 0; !done; ++j) {
            const monthDaysTableRow = $(document.createElement('tr'));
            daysTable.append(monthDaysTableRow);

            for (let i = 0; i < 7; ++i) {
                const d = i + j * 7 + 1 - dayOfWeek;
                const column = $(document.createElement('td'))
                    .text(d <= daysCount && offset-- <= 0 ? d : '');

                (function (d) {
                    if (column.text().trim().length) {
                        column
                            .css('cursor', 'pointer')
                            .click(function () {
                                setDay(datepicker, d, true);
                                dpCallback && dpCallback(getDate(datepicker));
                                $(this).closest('.datepicker-window').remove();
                            });
                    }
                })(d);

                if (getDay(datepicker) === d && new Date().getFullYear() == getYear(datepicker) && new Date().getMonth() == getMonth(datepicker)) {
                    column.css('background-color', '#eeeeee');
                }

                monthDaysTableRow.append(column);

                if (d >= daysCount) {
                    done = true;
                }
            }
        }
    }
}

function setYear(datepicker, year, dontRebuild) {
    datepicker.find('input[type=hidden][name=year]').val(year);

    if (!dontRebuild) {
        rebuildDatepicker(datepicker);
    }
}

function setMonth(datepicker, month, dontRebuild) {
    datepicker.find('input[type=hidden][name=month]').val(month);
    
    if (!dontRebuild) {
        rebuildDatepicker(datepicker);
    }
}

function setDay(datepicker, day, dontRebuild) {
    datepicker.find('input[type=hidden][name=day]').val(day);
    
    if (!dontRebuild) {
        rebuildDatepicker(datepicker);
    }
}

function setDate(datepicker, year, month, day) {
    setYear(datepicker, year, true);
    setMonth(datepicker, month, true);
    setDay(datepicker, day, true);
    rebuildDatepicker(datepicker);
}

let dpCallback;

function createDatepicker(callback) {
    dpCallback = callback;

    const window = $(document.createElement('div'))
        .addClass('datepicker-window');

    // hidden fields

    const hiddenDay = $(document.createElement('input'))
        .attr('type', 'hidden')
        .attr('name', 'day');
    window.append(hiddenDay);

    const hiddenMonth = $(document.createElement('input'))
        .attr('type', 'hidden')
        .attr('name', 'month');
    window.append(hiddenMonth);

    const hiddenYear = $(document.createElement('input'))
        .attr('type', 'hidden')
        .attr('name', 'year');
    window.append(hiddenYear);

    // header

    const header = $(document.createElement('div'))
        .addClass('datepicker-window-header');
    window.append(header);

    const prevMonthButton = $(document.createElement('a'))
        .attr('href', '/')
        .click(function (e) {
            e.stopPropagation();
            prevMonth($(this).parent().parent());
            return false;
        });
    header.append(prevMonthButton);

    const title = $(document.createElement('span'));
    header.append(title);

    const nextMonthButton = $(document.createElement('a'))
        .attr('href', '/')
        .click(function (e) {
            e.stopPropagation();
            nextMonth($(this).parent().parent());
            return false;
        });
    header.append(nextMonthButton);

    // set current date
    const today = new Date();
    setDate(window, today.getFullYear(), today.getMonth(), today.getDate());

    // week days table

    const daysTable = $(document.createElement('table'))
        .addClass('datepicker-window-days');
    window.append(daysTable);

    const daysTableRow = $(document.createElement('tr'));
    daysTable.append(daysTableRow);
    _.each(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], function (day) {
        const daysTableColumn = $(document.createElement('td'))
            .text(day);
        daysTableRow.append(daysTableColumn);
    });

    // month days table

    const monthDaysTable = $(document.createElement('table'))
        .addClass('datepicker-window-table');
    window.append(monthDaysTable);

    rebuildDatepicker(window);
    return window;
}
