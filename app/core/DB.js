import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('db.errandzangu');

export const addMyErrands = (one) => {
    let da1 = [one.errand_detail_id, one.customer_id, one.customer_name, one.po_box, one.email_address, one.phone_1, one.phone_2,
        one.city, one.physical_address, one.errand_start_date, one.errand_start_time, one.errand_duration, one.errand_assigned_to_id,
        one.assigned_to_name, one.assigned_to_username, one.assigned_to_user_group, one.assigned_to_role, one.assigned_to_base, one.errand_location,
        one.errand_budget, one.errand_status, one.errand_comments, one.created_by, one.created_on, one.edited_by, one.edited_on
    ];
    db.transaction(tx => {
        tx.executeSql(
            'insert or ignore INTO errands_details ' +
            '(errand_detail_id,customer_id,customer_name,po_box,email_address,phone_1,phone_2,' +
            'city,physical_address,errand_start_date,errand_start_time,errand_duration,errand_assigned_to_id,' +
            'assigned_to_name,assigned_to_username,assigned_to_user_group,assigned_to_role,assigned_to_base,errand_location,' +
            'errand_budget,errand_status,errand_comments,created_by,created_on,edited_by,edited_on)' +
            'values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', da1,
            (txObj, resultSet) => {},
            (txObj, error) => console.log('addMyErrands Error: ', error)
        )
    });
};

export const addPhotos = (one) => {

}