var fileName = "taiko_scores";
if ($request.url.indexOf('https://wl-taiko.wahlap.net/api/user/profile/songscore') != -1) {
    save_taiko_data();
    $done({});
} else if ($request.url.indexOf('https://www.baidu.com/api/ahfsdafbaqwerhue') != -1) {
    upload_taiko_data();
} else {
    $done({});
}

function upload_taiko_data() {
    var headers = {};
    headers["Content-Type"] = "application/json";
    headers["X-Data-Fetched"] = "1";
    var zipped_scores = $persistentStore.read(fileName);
    if (zipped_scores == null) {
        $notification.post('数据上传失败', '没有数据。请先打开 [微信 -> 鼓众广场 -> 游戏成绩] 以获取数据');
        $done({});
        return;
    }
    $notification.post('数据已成功上传', '请关闭此代理');
    var formattedJson = zipped_scores.replace(/,/g, ', ');
    $done({ status: 200, headers: headers, body: formattedJson });
}

function save_taiko_data() {
    console.log("start save_taiko_data");
    console.log("wtf.start =>", '$response: ', $response, 'status', $response.status, 'body', $response.body);
    if (!$response.body) {
        $notification.post('成绩数据失败', '数据为空');
        return;
    }
    const respDict = JSON.parse($response.body);

    if (respDict.status !== 0) {
        console.log(`错误: ${respDict.message}`);
        $notification.post('成绩数据失败', respDict.message);
        return;
    }

    const zippedScores = [];
    const scoreItems = respDict.data.scoreInfo || [];
    for (const scoreItem of scoreItems) {
        zippedScores.push([
            scoreItem.song_no,
            scoreItem.level,
            scoreItem.high_score,
            scoreItem.best_score_rank,
            scoreItem.good_cnt,
            scoreItem.ok_cnt,
            scoreItem.ng_cnt,
            scoreItem.pound_cnt,
            scoreItem.combo_cnt,
            scoreItem.stage_cnt,
            scoreItem.clear_cnt,
            scoreItem.full_combo_cnt,
            scoreItem.dondaful_combo_cnt,
            scoreItem.update_datetime
        ]);
    }

    const encodedZippedScores = JSON.stringify(zippedScores);
    $persistentStore.write(encodedZippedScores, fileName);
    $notification.post('成绩数据已获取', '保持本程序打开。打开微信DonNote小程序，选择“数据同步-成绩同步”功能，数据将会被自动提交给DonNote。');
}