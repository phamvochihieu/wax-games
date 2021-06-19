// ==UserScript==
// @name         Auto MWM Bot For Multiple Units
// @namespace    game2.metal-war.com
// @version      1.0.0
// @description  Auto Script FOR MWM
// @author       HieuPham
// @match        http*://game2.metal-war.com
// @icon         https://game2.metal-war.com/_nuxt/img/ant.5cc4b20.png
// @updateURL    https://raw.githubusercontent.com/phamvochihieu/alienworlds/main/metal-war.js
// @downloadURL  https://raw.githubusercontent.com/phamvochihieu/alienworlds/main/metal-war.js
// @grant        none
// ==/UserScript==

(function init() {

  const NUMBER_OF_UNIT = 2;
  const RAID = NUMBER_OF_UNIT;
  const MILISECOND = 1000;
  const SECOND = 60;
  const DELAY = 30;
  const SLEEP = 20;
  const DEFAULT_TIMEOUT = 1 * MILISECOND;
  const LOG_COLOR = 'color: pink; background: black';
  const LOG_COLOR_ERROR = 'color: red; background: black';
  const WEB_HOOK_IMP = 'https://discord.com/api/webhooks/855439270953484298/hieupham';
  const WEB_HOOK = 'https://discord.com/api/webhooks/855465411592060998/hieupham';
  const ALLOW_WEB_HOOK = false;

  var raidTimes = [new Date()];
  var logs = [];
  var erorr_count = 0;
  var username = 'unknow';

  // Log-error writer
  var LogCapturing = setInterval(function() {
    let notify_main = document.getElementsByClassName('notify_main');
    if (!notify_main) {
      return;
    }
    notify_main.forEach((message, i) => {
      let message_text = message.innerText.toString() || '';
      message_text = message_text.toLowerCase();
      if (message_text.includes("wrong")) {
        logs.push(message_text); // push to the array
        sendMessage(message_text, true); // send to webhook
      }
      if (message_text.includes("error")) {
        sendMessage(message_text, true); // send to webhook
      }
      sendMessage(message_text); // send to webhook
    });
    setInterval(LogCapturing, 20 * MILISECOND);
  }, 10 * MILISECOND);

  // Log monitoring
  var LogMonitoring = setInterval(function() {
    erorr_count = 0;
    if (logs.length > 5) {
      location.reload();
    } else {
      logs = [];
    }
  }, 10 * SECOND * MILISECOND);

  // Make sure you are loggged in - if not reload the page
  var CheckForLogin = setInterval(function() {
    let console_element = document.getElementsByClassName('console')[0];
    if (!console_element) {
      location.reload();
      return;
    }
    let console_text = console_element.innerText;
    if (console_text.startsWith("MetalWarGame:console")) {
      clearInterval(CheckForLogin);
      username = console_text.substring(20, console_text.lastIndexOf(' ')).trim(); // Get user name
    }
  }, 10 * SECOND * MILISECOND);

  // Wait for login
  var WaitForLogin = setInterval(function() {
    let login_button = document.getElementById('ual-button');
    if (!login_button) {
      console.log(`%c ${new Date().toLocaleString()} - Can't find the login_button`, LOG_COLOR_ERROR);
      sendMessage(`${new Date().toLocaleString()} - Can't find the login_button`, true);
      return;
    }
    // do click login
    login_button.click();
    setInterval(WaitForLogin, 15 * MILISECOND);
    setInterval(CheckForLogin, 60 * MILISECOND);
    setTimeout(() => {
      let wallets = document.getElementsByClassName('ual-auth-text');
      if (!wallets) {
        console.log(`%c ${new Date().toLocaleString()} - Can't find the wallets`, LOG_COLOR_ERROR);
        sendMessage(`${new Date().toLocaleString()} - Can't find the wallets`, true);
        return;
      }

      let wax_wallet = null;
      wallets.forEach((button, i) => {
        if (button.innerText.toString().toLowerCase() == "wax cloud wallet") {
          wax_wallet = button;
          return;
        }
      });
      if (!wax_wallet) {
        console.log(`%c ${new Date().toLocaleString()} - Can't find the wax wallet`, LOG_COLOR_ERROR);
        sendMessage(`${new Date().toLocaleString()} - Can't find the wax wallet`, true);
        return;
      }
      wax_wallet.click();

      clearInterval(WaitForLogin);

      console.log(`%c ${new Date().toLocaleString()} - Login success`, LOG_COLOR);

      setInterval(WaitForOpenTab, 5 * MILISECOND);

    }, 5 * MILISECOND);
  }, 5 * MILISECOND);

  // Open the popup info
  var WaitForOpenTab = setInterval(function() {
    let shards_wrapper = document.getElementsByClassName('shards_wrapper')[0];
    if (!shards_wrapper || shards_wrapper.style.getPropertyValue("opacity").toString() != "1") {
      // do open the shards_wrapper (repair info_button)
      let info_button = document.getElementsByClassName('repair info_button')[0];
      if (!info_button) {
        console.log(`%c ${new Date().toLocaleString()} - Can't find the info_button`, LOG_COLOR_ERROR);
        sendMessage(`${new Date().toLocaleString()} - Can't find the info_button`, true);
        return;
      }
      // do click
      info_button.click();
    }

    let tabs_element = shards_wrapper.getElementsByClassName('tabs')[0];
    if (!tabs_element) {
      console.log(`%c ${new Date().toLocaleString()} - Can't find the tabs_element`, LOG_COLOR_ERROR);
      sendMessage(`${new Date().toLocaleString()} - Can't find the tabs_element`, true);
      return;
    }
    let tabs = tabs_element.children;

    let unit_tab = null;
    tabs.forEach((button, i) => {
      if (button.innerText.toString().toLowerCase() == "units") {
        unit_tab = button;
        return;
      }
    });
    if (!unit_tab) {
      console.log(`%c ${new Date().toLocaleString()} - Can't find the units tab`, LOG_COLOR_ERROR);
      sendMessage(`${new Date().toLocaleString()} - Can't find the units tab`, true);
      return;
    }

    if (unit_tab.classList.contains("active_tab")) return;

    unit_tab.click();
    setInterval(WaitForOpenTab, 5 * SECOND * MILISECOND);
    console.log(`%c ${new Date().toLocaleString()} - Open the info`, LOG_COLOR);
    setInterval(WaitForMining, 10 * MILISECOND);
    erorr_count = 0;

  }, 20 * MILISECOND);

  // Mining - excute every minutes
  var WaitForMining = setInterval(() => {
    let units_container = document.getElementsByClassName('units_container')[0];
    if (!units_container) {
      console.log(`%c ${new Date().toLocaleString()} - Can't find the units_container`, LOG_COLOR_ERROR);
      erorr_count++;
      setInterval(WaitForOpenTab, 5 * MILISECOND);

      if (erorr_count > 2) {
        sendMessage(`${new Date().toLocaleString()} - Can't find the units_container`, true);
      }

      if (erorr_count > 5) {
        location.reload();
      }
      return;
    }

    setInterval(LogCapturing, 10 * MILISECOND); // Enable log monitor

    let units = units_container.children;
    // Loop all tanks
    for (let i = 0; i < units.length; i++) {
      doMining(units, i);
    }
    // Reset the time
    setInterval(WaitForMining, RAID * SECOND * MILISECOND);
  }, 30 * MILISECOND);

  // Do mining
  function doMining(units, i) {
    setTimeout(() => {
      let item = units[i];

      // Check HP- Repair the tool
      let hp_text = item.getElementsByClassName('hp_text')[0];
      if (!hp_text) {
        return
      };
      let needRepair = hp_text.innerText.startsWith("0/");
      if (needRepair) {
        let button = item.getElementsByClassName('button raid')[0];
        if (button) {
          button.click();
          console.log(`%c ${new Date().toLocaleString()} - Tank #${i+1} reparing ......`, LOG_COLOR);
        } else {
          console.log(`%c ${new Date().toLocaleString()} - Tank #${i+1} - An error occurred`, LOG_COLOR_ERROR);
        }
      } else {
        console.log(`%c ${new Date().toLocaleString()} - Tank #${i+1} HP: ${hp_text.innerText}`, LOG_COLOR);
      }

      setTimeout(() => {
        // Check remaining time - Click perform the rading
        let timer = item.getElementsByClassName('button raid')[1];
        let remainSeconds = 0;
        if (timer && timer.outerText != "RAID") {
          let timerEl = timer.outerText.split(':');
          remainSeconds = Number(timerEl[0]) * 60 + Number(timerEl[1]);
        }

        if (raidTimes.length < i + 1) {
          raidTimes.push(new Date());
        }
        let raidTime_i = raidTimes[i];

        if (!timer ||
          remainSeconds < 100 ||
          (new Date() - raidTime_i) > 59 * SECOND * MILISECOND) {

          let raid_button = item.getElementsByClassName('button raid')[1];
          if (raid_button) {
            if (raid_button.outerText == "RAID") {
              raid_button.click();
              raidTimes[i] = new Date();
              console.log(`%c ${new Date().toLocaleString()} - Click raid for tanks #${i+1}`, LOG_COLOR);
            } else {
              console.log(`%c ${new Date().toLocaleString()} - Tank #${i+1} mining inprogress (${remainSeconds})`, LOG_COLOR);
            }
          } else {
            console.log(`%c ${new Date().toLocaleString()}- Cannot find raid_button`, LOG_COLOR_ERROR);
          }
        } else {
          console.log(`%c ${new Date().toLocaleString()} - Tank #${i+1}, remaining time ${timer.outerText} (${remainSeconds})`, LOG_COLOR);
        }
      }, 10 * MILISECOND);
    }, ((i + 1) * 20) * MILISECOND);
  }

  // Send message to webhook
  function sendMessage(message, errorLevel) {
    if (!ALLOW_WEB_HOOK) return;
    message = message || 'message text empty';
    errorLevel = errorLevel || false;

    // Add the log to all messages chanel
    var request = new XMLHttpRequest();
    request.open("POST", WEB_HOOK);
    request.setRequestHeader('Content-type', 'application/json');
    var params = {
      username: `Captain ${errorLevel?'Error':'Warning'}`,
      avatar_url: "https://game2.metal-war.com/_nuxt/img/ant.5cc4b20.png",
      content: `(${username}) - ${message}`
    }
    request.send(JSON.stringify(params));

    // Add the log to error messages chanel
    if (errorLevel) {
      var request_imp = new XMLHttpRequest();
      request_imp.open("POST", WEB_HOOK_IMP);
      request_imp.setRequestHeader('Content-type', 'application/json');
      var params_imp = {
        username: `Captain Bot`,
        avatar_url: "https://game2.metal-war.com/_nuxt/img/ant.5cc4b20.png",
        content: `(${username}) - ${message}`
      }
      request_imp.send(JSON.stringify(params_imp));
    }
  }

  // END
})();
