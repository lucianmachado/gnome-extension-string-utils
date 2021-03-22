const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const ByteArray = imports.byteArray;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const Clipboard = St.Clipboard.get_default();


const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('My Shiny Indicator'));

            let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
            box.add_child(new St.Icon({
                icon_name: 'face-smile-symbolic',
                style_class: 'system-status-icon',
            }));
            box.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
            this.add_child(box);

            this._include_search()
            this._load_functions()
        }
        _include_search() {
            this._entryItem = new PopupMenu.PopupBaseMenuItem({
                reactive: false,
                can_focus: false
            });
            this.searchEntry = new St.Entry({
                name: 'searchEntry',
                style_class: 'search-entry',
                can_focus: true,
                hint_text: _('Type here...'),
                track_hover: true,
                x_expand: true,
                y_expand: true
            });
            this._entryItem.add(this.searchEntry);
            this.menu.addMenuItem(this._entryItem)
        }

        _load_functions() {
            this._include_function('Encode Base64', (input) => {
                return GLib.base64_encode(input);
            })

            this._include_function('Decode from Base64', (input) => {
                return ByteArray.toString(GLib.base64_decode(input));
            })

            this._include_function('JSON Stringify', (input) => {
                return JSON.stringify(input).replace(/\\n/g, '');
            })

            this._include_function('JSON Parse', (input) => {
                return JSON.parse(input);
            })

            this._include_function('Encode URI', (str) => {
                return encodeURI(str)                
            })

            this._include_function('Decode URI', (str) => {
                return decodeURI(str)                
            })

            this._include_function('Lorem IPSUM', (str)=>{
                const words = ["ad", "adipisicing", "aliqua", "aliquip", "amet", "anim", "aute", "cillum", "commodo", "consectetur", "consequat", "culpa", "cupidatat", "deserunt", "do", "dolor", "dolore", "duis", "ea", "eiusmod", "elit", "enim", "esse", "est", "et", "eu", "ex", "excepteur", "exercitation", "fugiat", "id", "in", "incididunt", "ipsum", "irure", "labore", "laboris", "laborum", "Lorem", "magna", "minim", "mollit", "nisi", "non", "nostrud", "nulla", "occaecat", "officia", "pariatur", "proident", "qui", "quis", "reprehenderit", "sint", "sit", "sunt", "tempor", "ullamco", "ut", "velit", "veniam", "voluptate"];
                let sentence = "";
            
                for (let i = 0; i < 100; i++) {
                    const pos = Math.floor(Math.random() * (words.length - 1));
                    sentence += words[pos] + " ";
                }
            
                sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1).trim() + ".";
                return sentence
            })
        }

        _include_function(label, fn) {
            let button = new PopupMenu.PopupMenuItem(_(label));

            button.connect('activate', () => {
                let output = fn(this._get_search())
                this._set_search(output);
                this._set_clipboard(output)
            });
            this.menu.addMenuItem(button);
        }

        _include_separator() {
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        }

        _set_clipboard(txt) {
            Clipboard.set_text(St.ClipboardType.CLIPBOARD, txt);
            Main.notify(_('Saved to clipboard'));
        }

        _set_search(txt) {
            this.searchEntry.set_text(txt)
        }

        _get_search() {
            return this.searchEntry.get_text();
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
