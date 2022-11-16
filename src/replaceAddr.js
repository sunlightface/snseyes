function processText() {
    var txtBox = document.getElementById("missionname");

    var regramAddr = txtBox.value.split("\n");

    var weakKeyword = ['328| ', '534| ', '329| ', '535| '];
    var weakKeywordCount = [' |100', ' |1000', ' |900', ' |2'];

    var strongKeyword1 = ['329| ', '552|', '534| ', '448| '];
    var strongKeyword1Count = [' |100', ' |100', ' |1000', ' |30'];

    var strongKeyword2 = ['329| ', '2000| '];
    var strongKeyword2Count = [' 2000|', ' 1000|'];

    var resultString = '';
    for (var i = 0; i < 4; i++) {
        resultString += weakKeyword[0] + regramAddr[i] + weakKeywordCount[0] + "\n";
        resultString += weakKeyword[1] + regramAddr[i] + weakKeywordCount[1] + "\n";
        resultString += weakKeyword[2] + regramAddr[i] + weakKeywordCount[2] + "\n";
        resultString += weakKeyword[3] + regramAddr[i] + weakKeywordCount[3] + "\n\n";
    }
    alert(resultString);

}
processText();

