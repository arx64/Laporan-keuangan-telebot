//CONFIG
var BOT_TOKEN = "MASUKKAN DISINI" //BOT TOKEN ANDA
var SS_URL = "MASUKKAN URL SPREADSHEET DISINI" //URL SPREADSHEET
var SHEET_NAME = "laporan" //NAMA SHEET

var USERS = [
	xxxxxxxx, 
  xxxxxxxx
] //CHAT ID, bisa lebih dari 1


//BEGIN
var SHEET = SpreadsheetApp.openByUrl(SS_URL).getSheetByName(SHEET_NAME);

function doGet(e) {
	return HtmlService.createHtmlOutput('<h1>OK</h1>')
}

function doPost(e) {
	if (e.postData.type == "application/json") {
		let update = JSON.parse(e.postData.contents);
		if (update) {
			commands(update)
			return true
		}
	}
}

function commands(update) {
  let chatId = update.message.chat.id;
  let first_name = update.message.chat.first_name;
  let text = update.message.text || '';
  let tanggal_input = new Date().toLocaleString();
  let messageId = update.message.message_id;
  let userId = update.message.from.id;

  if (USERS.includes(chatId)) {
    switch (true) {
      case text.startsWith("/start"):
        sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `Halo ${first_name}, Mulai laporan dengan cara \n/new [jumlah] [#kategori] [periode] [nama]\n\nContoh: /new 5000 #masuk 12/23 Muhammad Arifin Ilham`
        });
        break;

      case text.startsWith("/new"):
        let nama,
          jumlah,
          kategori,
          periode,
          stext = text.split(' ');

          if (stext[1] == '') {
          sendMessage({
            chat_id: chatId,
            reply_to_message_id: messageId,
            text: `Buat`
          });
          }

        jumlah = eval(stext[1]);
        kategori = stext[2].startsWith('#') ? stext[2].replace('#', '') : '';
        periode = stext[3];
        stext.splice(0, 4);
        nama = stext.join(' ');

        if (jumlah && kategori && periode && nama || jumlah && kategori && periode && nama !== '') {
          insert_value([
            tanggal_input,
            kategori,
            nama,
            jumlah,
            periode,
            chatId,
            first_name
          ], SHEET);

          sendMessage({
            chat_id: chatId,
            reply_to_message_id: messageId,
            text: `Sukses membuat laporan dengan detail:\n\n Nama: ${nama}\n Uang masuk: ${jumlah}\n Periode: ${periode}\n\nSource Data: ${SS_URL}`
          });
        } else {
          sendMessage({
            chat_id: chatId,
            reply_to_message_id: messageId,
            text: `Gagal. Pastikan sesuai format. \n/new [jumlah] [#kategori] [periode] [nama]\n\nContoh: /new 5000 #masuk 12/23 Muhammad Arifin Ilham\n\n${stext}`
          });
        }
        break;

      case text.startsWith("/get_data"):
        sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `Haloo, ${first_name}. tunggu sebentar yaa`
        });
        getData(chatId);
        break;

      case text.startsWith("/hapus"):
        let idDelete = text.replace('/hapus', '');
        // let getId = id[1];
        hapusData(idDelete);
        sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `Sukses hapus data dengan ID ${idDelete} dari Google Sheets`
        });
        getData(chatId);
        break;

      case text.startsWith("/edit"):
        // Mendapatkan bagian-bagian dari teks
        let parts = text.replace('/edit', '').split(' ');

        // Mendapatkan ID edit
        let editId = parts[0];
        // Mendapatkan jumlahEdit
        let jumlahEdit = parts[1];

        // Memeriksa jumlah edit, jika kosong maka kirimkan pesan
        if (!jumlahEdit || jumlahEdit.trim() === '') {
            sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          parse_mode: 'Markdown',
          text: `Untuk melakukan pengeditan, silakan kirimkan format:\n*/edit${editId} 1000 #keluar 01/24 Nama Baru*`
          });
        }
        // Mendapatkan kategoriEdit
        let kategoriEdit = parts[2].replace('#', '');
        // Mendapatkan periodeEdit
        let periodeEdit = parts[3];
        // Mendapatkan namaEdit
        let namaEdit = parts.slice(4).join(' ');

        let newDataToUpdate = [namaEdit, periodeEdit, kategoriEdit, jumlahEdit, tanggal_input , first_name];

        updateData(editId, newDataToUpdate);

        sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `Sukses edit data dengan ID: ${parts[0]}`
        });
          getData(chatId);
        break;

        case text.startsWith("/help"):
  sendMessage({
chat_id: chatId,
reply_to_message_id: messageId,
parse_mode: 'Markdown',
text: `Halo ${first_name}, berikut adalah beberapa fitur yang tersedia:

*/new*  =>  digunakan untuk menambahkan data baru ke dalam Google Sheets.
Contoh penggunaan: 
*/new 5000 #masuk 12/23 Muhammad Arifin Ilham*

*/get_data* =>  digunakan untuk mengambil semua data dari Google Sheets.
Contoh penggunaan: 
*/get_data*

*/hapus#ID_Acak*  =>  digunakan untuk menghapus data dari Google Sheets berdasarkan ID.
Contoh penggunaan: 
*/hapus9af6ca0d1100*

*/edit#ID_Acak*  =>  digunakan untuk meng-edit data dari Google Sheets berdasarkan ID.
Contoh penggunaan: 
*/edit9af76b821eb2 5000 #masuk 12/23 Muhammad Arifin Ilham*

`});
          break;

      default:
        sendMessage({
          chat_id: chatId,
          reply_to_message_id: messageId,
          text: `halo ${first_name}, Perintah tidak ditemukan!`
        });

        break;
    }
  } else {
    const originalText = `Halo, saya ${first_name}. ID Saya: ${userId}, saya ingin melakukan input data di Bot Telegram.`;
    const encodedText = encodeURIComponent(originalText).replace(/%20/g, '+');
    sendMessage({
      chat_id: chatId,
      reply_to_message_id: messageId,
      parse_mode: 'HTML',
      text: `Haloo, ${first_name}.\nID Kamu: ${userId}\n\nKamu belum bisa melakukan input data nih!\n\nUntuk dapat melakukan input data, silakan hubungi saya di <a href='wa.me/6285265681313?text=${encodedText}'>WhatsApp</a>`
    });
  }
}


function updateData(id, newData) {
  // Mencari baris yang sesuai dengan ID
  var data = SHEET.getDataRange().getValues();
  var rowIndex = data.findIndex(row => row[0] === id) + 1; // Baris keberapa (ditambah 2 karena dimulai dari baris ke-2)

  // Menentukan kolom-kolom yang ingin diupdate
  var columnsToUpdate = ["Nama", "Periode", "Kategori", "Jumlah", "Tanggal Update", "Nama Peng-update"];

// Memasukkan data baru pada baris yang sesuai untuk kolom yang diupdate
  for (var i = 0; i < columnsToUpdate.length; i++) {
    var columnIndex = data[0].indexOf(columnsToUpdate[i]) + 1; // Kolom keberapa (ditambah 1 karena dimulai dari kolom ke-1)
    SHEET.getRange(rowIndex, columnIndex).setValue(newData[i]);
  }
}

function getAllData(sheet, chatId) {
  try {
    return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  } catch (error) {

    if (error.message == 'The number of rows in the range must be at least 1.') {
      let message = `Data belum ada di Google Sheets!`;
        sendMessage({
        chat_id: chatId,
        text: message
    });
    } else { 
    let message = `Pesan Error: ${error.message}`;
    console.log(`Error: ${error.message}`);

        sendMessage({
        chat_id: chatId,
        text: message
    });
  }
  }
}

function getData(chatId) {
    let data = getAllData(SHEET, chatId);
    let message = "Data dari Google Sheets:\n";

    data.forEach(row => {
      let tgl = row[1].toLocaleString();

        message += `
Nama Pelapor: ${row[7]} 
Tanggal input: ${tgl} 
Nama: ${row[3]}
Periode: ${row[5]} 
Kategori: ${row[2]} 
Jumlah: ${row[4]} 
Hapus => (/hapus${row[0]})
Edit => (/edit${row[0]})
`;

  });

    message += `\n\nSource Data: <a href='${SS_URL}'>Google Spreadsheet</a>`;
    sendMessage({
        chat_id: chatId,
        parse_mode: 'HTML',
        text: message
    });
}

function hapusData(id) {
  // Mencari baris yang sesuai dengan ID
  var data = SHEET.getDataRange().getValues();
  var rowIndex = data.findIndex(row => row[0] === id) + 1; // Baris keberapa (ditambah 2 karena dimulai dari baris ke-2)

  // Menghapus baris
  SHEET.deleteRow(rowIndex);
}

function sendMessage(postdata) {
	var options = {
		'method': 'post',
		'contentType': 'application/json',
		'payload': JSON.stringify(postdata),
		'muteHttpExceptions': true
	};
	let response = UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', options);

Logger.log(response.getContentText()); 
}
