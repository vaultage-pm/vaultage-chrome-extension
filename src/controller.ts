import * as escape from 'escape-html';
import { IVaultDBEntry } from 'vaultage-client';

import { LOGIN_MESSAGE, USE_PASSWORD_MESSAGE } from './messages';
import { Client } from './Messenger';


const client = new Client();

const $host = document.getElementById('login-host') as HTMLInputElement;
const $username = document.getElementById('login-username') as HTMLInputElement;
const $password = document.getElementById('login-password') as HTMLInputElement;
const $basicUsername = document.getElementById('basic-username') as HTMLInputElement;
const $basicPassword = document.getElementById('basic-password') as HTMLInputElement;
const $form = document.getElementById('login-form') as HTMLFormElement;
const $error = document.getElementById('error') as HTMLElement;

const $loadingFrame = document.getElementById('loading-frame') as HTMLElement;
const $loginFrame = document.getElementById('login-frame') as HTMLElement;
const $pickerFrame = document.getElementById('picker-frame') as HTMLElement;

const $pickerList = document.getElementById('picker-list') as HTMLElement;

$form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    submitForm();
});

restoreCached();

function getFullURL() {
    const base = $host.value.split('://');

    const user = $basicUsername.value;
    const password = $basicPassword.value;
    
    if (user != '' || password != '') {
        return `${base[0]}://${user}:${password}@${base.slice(1).join('://')}`;
    }
    return base.join('://');
}

async function submitForm() {
    $error.innerText = '';
    $loginFrame.classList.add('hidden');
    $loadingFrame.classList.remove('hidden');
    try {
        const response = await client.send(LOGIN_MESSAGE, {
            host: getFullURL(),
            username: $username.value,
            password: $password.value
        });
        // Login successful
        saveCached();
        console.log(response);
        refreshList(response.entries);
        $loadingFrame.classList.add('hidden');
        $pickerFrame.classList.remove('hidden');
    } catch (e) {
        $loginFrame.classList.remove('hidden');
        $loadingFrame.classList.add('hidden');
        $error.innerText = e.toString();
        console.error(e);
    }
}

async function usePassword(password: string) {
    $pickerFrame.classList.add('hidden');
    $loadingFrame.classList.remove('hidden');
    await client.send(USE_PASSWORD_MESSAGE, { password });
    window.close();
}

function refreshList(entries: IVaultDBEntry[]) {
    if (entries.length === 0) {
        $pickerList.innerHTML = `No results. <a href="${escape($host.value)}">Pick manually</a>`;
    } else {
        $pickerList.innerHTML = '';
        entries.forEach((e) => {
            const $el = document.createElement('div');
            $el.innerHTML = `<div class="picker-entry" tabindex="0">
                    <h3 class="title">${escape(e.title)}</h3>
                    <span class="user">${escape(e.login)}</span>
                    <span>&nbsp;@&nbsp;</span>
                    <span class="url">${escape(e.url)}</span>
                </div>`;
            $pickerList.appendChild($el);
            $el.addEventListener('click', () => {
                usePassword(e.password);
            });
            $el.addEventListener('keydown', (evt) => {
                if (evt.key === 'Enter') {
                    usePassword(e.password);
                }
            });
        });
    }
}

function restoreCached() {
    const cached = localStorage.getItem('vaultage:cached-creds');
    if (cached != null) {
        const creds = JSON.parse(cached);
        $host.value = creds.host;
        $username.value = creds.username;
        $basicUsername.value = creds.basic?.user ?? '';
        $basicPassword.value = creds.basic?.password ?? '';
        $password.focus();
    } else {
        $host.focus();
    }
}

function saveCached() {
    const creds = {
        host: $host.value,
        username: $username.value,
        basic: {
            user: $basicUsername.value,
            password: $basicPassword.value
        }
    };

    localStorage.setItem('vaultage:cached-creds', JSON.stringify(creds));
}
