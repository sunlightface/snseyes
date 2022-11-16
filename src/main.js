'use strict';

const INSTAGRAM_HOSTNAME = 'www.instagram.com';

let nonFollowersList = [];
let userIdsToUnfollow = [];
let isActiveProcess = false;

// Prompt user if he tries to leave while in the middle of a process (searching / unfollowing / etc..)
// This is especially good for avoiding accidental tab closing which would result in a frustrating experience.
window.addEventListener('beforeunload', e => {
    if (!isActiveProcess) {
        return;
    }
    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
        e.returnValue = 'Changes you made may not be saved.';
    }

    // For Safari
    return 'Changes you made may not be saved.';
});

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function afterUrlGenerator(nextCode) {
    const ds_user_id = getCookie('ds_user_id');
    return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${nextCode}"}`;
}

function unfollowUserUrlGenerator(idToUnfollow) {
    return `https://www.instagram.com/web/friendships/${idToUnfollow}/unfollow/`;
}

function getElementByClass(className) {
    const el = document.querySelector(className);
    if (el === null) {
        throw new Error(`Unable to find element by class: ${className}`);
    }
    return el;
}

function getUserById(userId) {
    const user = nonFollowersList.find(user => {
        return user.id.toString() === userId.toString();
    });
    if (user === undefined) {
        console.error(`Unable to find user by id. userId: ${userId}`);
    }
    return user;
}

function renderResults(resultsList) {

    const elResultsContainer = getElementByClass('.iu_results-container');
    
	elResultsContainer.innerHTML = '';
    
    resultsList.forEach(user => {
        
        elResultsContainer.innerHTML += `<div style='display:flex;flex-direction:column;padding:0.5rem;'>${user.username}</div>`;
         
    });
}

async function run(shouldIncludeVerifiedAccounts) {
    getElementByClass('.iu_main-btn').remove();
    getElementByClass('.iu_include-verified-checkbox').disabled = true;
    nonFollowersList = await getNonFollowersList(shouldIncludeVerifiedAccounts);
	userIdsToUnfollow = nonFollowersList.map(user => user.id);
	
}

function renderOverlay() {
    let shouldIncludeVerifiedAccounts = true;
    document.documentElement.style.backgroundColor = 'white';
    const el = document.createElement('div');
    el.setAttribute('class', 'iu_overlay');
    el.setAttribute('style', ['background-color:white', 'color:black', 'height:100%', 'font-family:system-ui'].join(';'));
    el.innerHTML = `<header style='position:fixed;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:1rem;height:2.5rem;background-color:white;z-index:1;'>
        <div style=font-size:2em;cursor:pointer;' onclick='location.reload()'>SNSEYES</div>
		<label style='display:flex;cursor:pointer;'><input type='checkbox' class='iu_include-verified-checkbox' />&nbsp;Include verified</label>
        <div class='iu_progressbar-container' style='display:none;width:120px;height:30px;border-radius:5px;position:relative;border:1px solid #7b7777;'>
            <div class='iu_progressbar-bar' style='width:0;height:100%;background-color:#7b7777;'></div>
            <label class='iu_progressbar-text' style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'>0%</label>
        </div>
        <div>Non-followers: <span class='iu_nonfollower-count' /></div>
        <div style='font-size:2em;text-decoration:underline;color:red;cursor:pointer;' onclick='unfollow()'>RUN </div>
        
    </header>
    <div class='iu_sleeping-container' style='position: fixed; bottom: 0; left: 0px; right: 0px; display: none; padding: 1rem; background-color: #000; z-index: 1;color: yellow; font-weight:bold'></div>
    <button class='iu_main-btn' style='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:2em;cursor:pointer;height:160px;width:160px;border-radius:50%;background:transparent;color:currentColor;border:1px solid currentColor;'>RUN</button>
    <div class='iu_results-container' style='transform:translateY(75px)'></div>`;
    document.body.replaceChildren(el);

    // Assigned here separately instead of inline due to variables and functions not being recognized when used as bookmarklet.
    getElementByClass('.iu_main-btn').addEventListener('click', () => run(shouldIncludeVerifiedAccounts));
    const elShouldIncludeVerified = getElementByClass('.iu_include-verified-checkbox');
    elShouldIncludeVerified.checked = shouldIncludeVerifiedAccounts;
    elShouldIncludeVerified.addEventListener(
        'change',
        () => (shouldIncludeVerifiedAccounts = !shouldIncludeVerifiedAccounts),
    );
}

async function getNonFollowersList(shouldIncludeVerifiedAccounts = true) {
    if (isActiveProcess) {
        return;
    }

    let list = [];
    let hasNext = true;
    let scrollCycle = 0;
    let currentFollowedUsersCount = 0;
    let totalFollowedUsersCount = -1;
    isActiveProcess = true;

    const ds_user_id = getCookie('ds_user_id');
    let url = `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`;

    getElementByClass('.iu_progressbar-container').style.display = 'block';
    const elProgressbarBar = getElementByClass('.iu_progressbar-bar');
    const elProgressbarText = getElementByClass('.iu_progressbar-text');
    const elNonFollowerCount = getElementByClass('.iu_nonfollower-count');
    const elSleepingContainer = getElementByClass('.iu_sleeping-container');

	
	
    while (hasNext) {
        
		let receivedData;
		
        try {
            receivedData = await fetch(url).then(res => res.json());
        } catch (e) {
            console.error(e);
            continue;
        }

        if (totalFollowedUsersCount === -1) {
            totalFollowedUsersCount = receivedData.data.user.edge_follow.count;
        }

        hasNext = receivedData.data.user.edge_follow.page_info.has_next_page;
        url = afterUrlGenerator(receivedData.data.user.edge_follow.page_info.end_cursor);
        currentFollowedUsersCount += receivedData.data.user.edge_follow.edges.length;

        receivedData.data.user.edge_follow.edges.forEach(x => {
            if (!shouldIncludeVerifiedAccounts && x.node.is_verified) {
                return;
            }
            if (!x.node.follows_viewer) {
                list.push(x.node);
            }
        });
		
        const percentage = `${Math.ceil((currentFollowedUsersCount / totalFollowedUsersCount) * 100)}%`;
        elProgressbarText.innerHTML = percentage;
        elProgressbarBar.style.width = percentage;
        elNonFollowerCount.innerHTML = list.length.toString();
        
        await sleep(Math.floor(Math.random() * (1000 - 600)) + 1000);
        scrollCycle++;
        if (scrollCycle > 6) {
            scrollCycle = 0;
            elSleepingContainer.style.display = 'block';
            elSleepingContainer.innerHTML = 'Sleeping 10 secs to prevent getting temp blocked...';
            await sleep(10000);
        }
        elSleepingContainer.style.display = 'none';
    }
	
    elProgressbarBar.style.backgroundColor = '#59A942';
    elProgressbarText.innerHTML = 'DONE';

    isActiveProcess = false;

	let resultList;
	if(list.length >= 500)
	{
		resultList = list.slice(0,500);
	}
	else 
	{
		resultList = list.slice(0,list.length);
	}
	
	renderResults(resultList);
	
		
	return resultList;
}

window.unfollow = async () => {
	
	
	
    if (isActiveProcess) {
        return;
    }
    if (userIdsToUnfollow.length === 0) {
        alert('Must select at least a single user to unfollow');
        return;
    }
    if (!confirm('Are you sure?')) {
        return;
    }

    let csrftoken = getCookie('csrftoken');
    if (csrftoken === undefined) {
        throw new Error('csrftoken cookie is undefined');
    }
		
    const elSleepingContainer = getElementByClass('.iu_sleeping-container');
    const elResultsContainer = getElementByClass('.iu_results-container');
    elResultsContainer.innerHTML = '';
	
    const scrollToBottom = () => window.scrollTo(0, elResultsContainer.scrollHeight);

    isActiveProcess = true;
    let counter = 0;
    for (const id of userIdsToUnfollow) {
        const user = getUserById(id);
        try {
            await fetch(unfollowUserUrlGenerator(id), {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-csrftoken': csrftoken,
                },
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
            });
            elResultsContainer.innerHTML += 
			`<div style='padding:0.5rem; display:flex;'>
				<div>Unfollowed&nbsp;</div>
                <div style='width:200px;'><a style='color:inherit' target='_blank' href='../${user.username}'> ${user.username}</a></div>
				<div style='color:red;'> [${counter + 1}/${userIdsToUnfollow.length}]</div>
             </div>`;
			
        } catch (e) {
            console.error(e);
            elResultsContainer.innerHTML += `<div style='padding:1rem;color:red;'>Failed to unfollow ${
                user.username
            } [${counter + 1}/${userIdsToUnfollow.length}]</div>`;
        }
        scrollToBottom();
        await sleep(Math.floor(Math.random() * (6000 - 4000)) + 4000);

        counter += 1;
        // If unfollowing the last user in the list, no reason to wait 5 minutes.
        if (id === userIdsToUnfollow[userIdsToUnfollow.length - 1]) {
            break;
        }
        if (counter % 5 === 0) {
            elSleepingContainer.style.display = 'block';
            elSleepingContainer.innerHTML = 'Sleeping 5 minutes to prevent getting temp blocked...';
            scrollToBottom();
            await sleep(300000);
        }
        elSleepingContainer.style.display = 'none';
    }

    isActiveProcess = false;
    elResultsContainer.innerHTML += `<hr /><div style='padding:1rem;font-size:1.25em;color:#56d756;'>All DONE!</div><hr />`;
    scrollToBottom();
};

function init() {
    if (location.hostname !== INSTAGRAM_HOSTNAME) {
        alert('Can be used only on Instagram routes');
        return;
    }
    document.title = 'SNSEYES';
    renderOverlay();
}

init();
