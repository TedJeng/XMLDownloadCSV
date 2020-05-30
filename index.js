let List = [];

let getXMLRequest = async () => {
    let response = await fetch('FM0501A1M.xml');
    let response_text = await response.text();
    let response_parse = await (new window.DOMParser()).parseFromString(response_text, "text/xml");
    await (List = response_parse);
}

let GetCSVText = (SeriesArray) => {
    let data = [];
    let years = [];
    let returnCSVText = '';
    SeriesArray.forEach((ElementSeries, idx) => {
        let item_name = ElementSeries.getAttribute('ITEM');
        if (item_name.indexOf("日平均數") > -1) {
            let Series = ElementSeries.querySelector('SeriesProperty');
            let SeriesList = Array.apply(null, Series.querySelectorAll('Obs'));
            let detail = [];

            if (idx === 0) {
                //header
                let header = [];
                header.push("項目");
                years = SeriesList.map(res => res.getAttribute('TIME_PERIOD').replace('M', ' '));
                header = [...header, ...years];
                data.push(header);
            }

            detail.push(item_name);
            SeriesList.forEach(ElementDetail => {
                let year = ElementDetail.getAttribute('TIME_PERIOD');
                let value = ElementDetail.getAttribute('OBS_VALUE');
                year = year.replace('M', ' ');
                if (isNaN(parseInt(value, 10))) {
                    value = "0";
                }
                //data[item_name][year] = [...detail, value];
                detail = [...detail, value];
            });

            data.push(detail);
        }
    })

    console.log(data);
    //handle data to text
    data.forEach(detail => {
        returnCSVText = `${returnCSVText}${detail.join(',')}\n`;
    })


    return returnCSVText;
}

getXMLRequest()
    .then(() => {
        let SeriesList = List.querySelectorAll('Series');
        let SeriesArray = Array.apply(null, SeriesList);
        let data = GetCSVText(SeriesArray);
        let blob = new Blob([`\ufeff${data}`], { //加上"\ufeff"防止亂碼
            'type': 'application/octet-stream'
        });
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = url;
        link.download = `FinancialStatistics${Date.now()}.csv`;
        link.click();
    });