// zeroDupTabs.js
// Created by kamatari

var MaxTabArrayNum	= 10000;
var openedTabArray	= new Array();
var closedTabArray	= new Array();

// extension ��ͭ���ˤʤä������ǳ����Ƥ���tab�ξ����stock
if (openedTabArray.length == 0) {
	chrome.windows.getAll({"populate" : true}, setAllTabInfo);
}

chrome.tabs.onUpdated.addListener(
	function(updateTabId, changeInfo, tabInfo) {
        //console.log('* here is updated function');
        for (key in openedTabArray) {
            // ���Ǥ˳����Ƥ���url�������ǳ����줿��,remove���Ƥ��Ǥ˳����Ƥ�������active�ˤ���
            if (openedTabArray[key].url === changeInfo.url) {
                //console.log('* remove url '+openedTabArray[updateTabId]);
                chrome.tabs.remove(updateTabId);
                if (openedTabArray[key].index != null) {
                    chrome.tabs.highlight({tabs: [openedTabArray[key]['index']]},function(){});
                }
            }
        }
        // ���������֤ˤʤäƤ���url�Ȥ���index����¸ (newtab�Ͻ���)
		if (changeInfo.url != null && changeInfo.url != 'chrome://newtab/') {
			openedTabArray[updateTabId] = {
                'url'   :   changeInfo.url,
                'index' :   tabInfo.index
            };
            //console.log('* add url to memory '+changeInfo.url);
			checkLengthAndArrayShift(openedTabArray);
		}
	}
);

chrome.tabs.onCreated.addListener(
    function(createdTab) {
        //console.log('* here is created function');
        if (createdTab.url != null && createdTab.url != 'chrome://newtab/') {
            for(key in openedTabArray){
                if(createdTab.index <= openedTabArray[key].index) {
                    openedTabArray[key].index = openedTabArray[key].index + 1;
                    //console.log('* incremented index '+openedTabArray[key].url);
                }
            }
        }
    }
);

// �Ĥ������֤�url����
chrome.tabs.onRemoved.addListener(
	function(closedTabId) {
		if (openedTabArray[closedTabId] != null) {
            for(key in openedTabArray){
                if(openedTabArray[closedTabId].index < openedTabArray[key].index) {
                    openedTabArray[key].index = openedTabArray[key].index - 1;
                    //console.log('* decremented index '+openedTabArray[key].url);
                }
            }
            //console.log('* close url '+openedTabArray[closedTabId].url);
			delete openedTabArray[closedTabId];
		}
	}
);


function setAllTabInfo(AllTabInfo) {
	for (var i=0; i<AllTabInfo.length; i++) {
		for (var j=0; j<AllTabInfo[i]['tabs'].length; j++) {
            // �������֤Ͻ���
            if (AllTabInfo[i]['tabs'][j].url == 'chrome://newtab/'){ continue; }
            // url��index��set�ˤ�����¸
			openedTabArray[AllTabInfo[i]['tabs'][j].id] = {
                'url'   :   AllTabInfo[i]['tabs'][j].url,
                'index' :   AllTabInfo[i]['tabs'][j].index
            };
            //console.log('* set url '+AllTabInfo[i]['tabs'][j].url);
		}
	}
}

function checkLengthAndArrayShift(urlArray) {
	var arrayCount = countLength(urlArray);
	if (arrayCount > MaxTabArrayNum) {
		for (key in urlArray) {
			delete urlArray[key];
			arrayCount--;
			if (arrayCount <= MaxTabArrayNum) {break;}
		}
	}
}

function countLength(inputArray) {
	var count = 0;
	for (var key in inputArray) { count++; }
	return count;
}
