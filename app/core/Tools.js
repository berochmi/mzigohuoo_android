export function diffDays(date1, date2) {
    let date_1 = new Date(date1);
    let date_2 = new Date(date2);
    let diff_time = date_1.getTime() - date_2.getTime();
    let diff_days = diff_time / (1000 * 3600 * 24);
    return diff_days;
}

export function addZero(i) { if (i < 10) { i = "0" + i; } return i; };

export const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const updateDBWhereAt = (db, stack, screen, last_date, logged_in) => {
    let sql = 'update users set last_stack = ?, last_screen = ?, last_date = ?, logged_in = ?;';
    db.transaction(tx => {
        tx.executeSql(sql, [stack, screen, last_date, logged_in],
            (txObj, resultSet) => {

                if (resultSet.rowsAffected > 0) {

                }
            },
            (txObj, error) => {

            }
        )
    });
};

export const currentDate = () => {
    return (new Date()).toISOString().slice(0, 10);
}

export function adedde(url, form_data, success_action, fail_action) {
    var xml_http_request = new XMLHttpRequest();
    xml_http_request.open("POST", url);
    xml_http_request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var fb_data = JSON.parse(xml_http_request.responseText);
            if (fb_data.matokeo == "success") {
                success_action(fb_data);
            } else if (fb_data.matokeo == "failed") {
                fail_action(fb_data);
            } else {
                console.log(fb_data.fb_msg);
            }
        }
    };
    xml_http_request.send(form_data);
}

export function myFetch(url, form_data, success_action, fail_action) {
    fetch(url, { method: "POST", body: JSON.stringify(form_data), signal: controller.signal })
        .then(response => response.json())
        .then(responseJson => {

            if (responseJson.matokeo == "success") {
                success_action(responseJson);
            } else if (responseJson.matokeo == "failed") {
                fail_action(responseJson);
            }
        })
        .catch(error => {
            if (error.name === "AbortError") {
                console.error(error);
            } else {
                console.error(error);

            }
            console.error(error);
        });

}