// ====== Pengaturan ======
const BATAS_DISKON = 200000;   // diskon berlaku jika total LEBIH dari angka ini
const PERSEN_DISKON = 0.05;    // 5%

// ====== Data menu kantin kampus ======
// Untuk menambah menu, cukup tambah satu baris di kategori yang sesuai.
const MENU = [
  { kategori: "Makanan berat", nama: "Nasi Rames",        harga: 9000  },
  { kategori: "Makanan berat", nama: "Nasi Telur",        harga: 8000  },
  { kategori: "Makanan berat", nama: "Nasi Goreng",       harga: 13000 },
  { kategori: "Makanan berat", nama: "Nasi Pecel",        harga: 10000 },
  { kategori: "Makanan berat", nama: "Ayam Geprek",       harga: 15000 },
  { kategori: "Makanan berat", nama: "Ayam Penyet",       harga: 16000 },
  { kategori: "Makanan berat", nama: "Soto Ayam",         harga: 15000 },
  { kategori: "Makanan berat", nama: "Gado-gado",         harga: 12000 },
  { kategori: "Makanan berat", nama: "Pecel Lele",        harga: 14000 },

  { kategori: "Mie dan bakso", nama: "Bakso",             harga: 10000 },
  { kategori: "Mie dan bakso", nama: "Mie Ayam",          harga: 12000 },
  { kategori: "Mie dan bakso", nama: "Mie Goreng",        harga: 11000 },
  { kategori: "Mie dan bakso", nama: "Mie Rebus",         harga: 10000 },
  { kategori: "Mie dan bakso", nama: "Bakso Urat",        harga: 13000 },

  { kategori: "Camilan",       nama: "Gorengan (tahu/tempe)", harga: 2000 },
  { kategori: "Camilan",       nama: "Pisang Goreng",     harga: 3000  },
  { kategori: "Camilan",       nama: "Risoles",           harga: 3000  },
  { kategori: "Camilan",       nama: "Batagor",           harga: 10000 },
  { kategori: "Camilan",       nama: "Kentang Goreng",    harga: 8000  },
  { kategori: "Camilan",       nama: "Roti Bakar",        harga: 8000  },

  { kategori: "Minuman",       nama: "Air Mineral",       harga: 3000  },
  { kategori: "Minuman",       nama: "Teh Hangat",        harga: 3000  },
  { kategori: "Minuman",       nama: "Es Teh Manis",      harga: 4000  },
  { kategori: "Minuman",       nama: "Kopi Hitam",        harga: 5000  },
  { kategori: "Minuman",       nama: "Es Jeruk",          harga: 6000  },
  { kategori: "Minuman",       nama: "Kopi Susu",         harga: 8000  },
  { kategori: "Minuman",       nama: "Es Cokelat",        harga: 8000  },
  { kategori: "Minuman",       nama: "Jus Alpukat",       harga: 12000 },
];

const KATEGORI = ["Semua", ...new Set(MENU.map((m) => m.kategori))];

// ====== Elemen ======
const elDaftarMenu = document.getElementById("daftarMenu");
const elTab       = document.getElementById("tabKategori");
const inCari      = document.getElementById("cari");
const elKosong    = document.getElementById("kosongMenu");
let barisItem     = [];
const elTotal     = document.getElementById("total");
const elDiskon    = document.getElementById("diskon");
const elSetelah   = document.getElementById("setelah");
const elLencana   = document.getElementById("lencana");
const inBayar     = document.getElementById("bayar");
const elKembalian = document.getElementById("kembalian");
const elLabelKmb  = document.getElementById("labelKembalian");
const kotakKmb    = document.getElementById("kotakKembalian");
const elInfo      = document.getElementById("infoDiskon");
const elIsiCetak  = document.getElementById("isiCetak");
const elTgl       = document.getElementById("tglCetak");
const elToast     = document.getElementById("toast");


// ====== Tampilkan daftar menu ======
function formatRp(n) { return "Rp " + n.toLocaleString("id-ID"); }

function renderMenu() {
  let nomor = 0;
  KATEGORI.slice(1).forEach((kat) => {
    const judul = document.createElement("h3");
    judul.className = "kategori-judul";
    judul.dataset.kategori = kat;
    judul.textContent = kat;
    elDaftarMenu.appendChild(judul);

    MENU.filter((m) => m.kategori === kat).forEach((m) => {
      nomor++;
      const id = "qty" + nomor;
      const baris = document.createElement("div");
      baris.className = "baris item";
      baris.dataset.nama = m.nama;
      baris.dataset.harga = m.harga;
      baris.dataset.kategori = kat;
      baris.innerHTML =
        '<span class="no">' + nomor + '.</span>' +
        '<label class="nama" for="' + id + '">' + m.nama + '<small>' + formatRp(m.harga) + '</small></label>' +
        '<div class="stepper">' +
          '<button type="button" class="step" data-aksi="kurang" aria-label="Kurangi ' + m.nama + '">&minus;</button>' +
          '<input type="number" id="' + id + '" class="qty" min="0" step="1" inputmode="numeric" placeholder="0">' +
          '<button type="button" class="step" data-aksi="tambah" aria-label="Tambah ' + m.nama + '">+</button>' +
        '</div>' +
        '<span class="subtotal kanan">Rp 0</span>';
      elDaftarMenu.appendChild(baris);
    });
  });
  barisItem = document.querySelectorAll(".item");
}

// ====== Filter kategori & pencarian ======
let kategoriAktif = "Semua";

function buatTab() {
  KATEGORI.forEach((kat) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab";
    b.textContent = kat;
    b.setAttribute("aria-pressed", kat === kategoriAktif);
    b.addEventListener("click", () => {
      kategoriAktif = kat;
      elTab.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-pressed", t === b));
      terapkanFilter();
    });
    elTab.appendChild(b);
  });
}

function terapkanFilter() {
  const kata = inCari.value.trim().toLowerCase();
  let tampil = 0;
  const adaIsi = {};

  barisItem.forEach((baris) => {
    const cocokKat = kategoriAktif === "Semua" || baris.dataset.kategori === kategoriAktif;
    const cocokNama = baris.dataset.nama.toLowerCase().includes(kata);
    const lihat = cocokKat && cocokNama;
    baris.hidden = !lihat;
    if (lihat) { tampil++; adaIsi[baris.dataset.kategori] = true; }
  });

  document.querySelectorAll(".kategori-judul").forEach((j) => {
    j.hidden = !adaIsi[j.dataset.kategori];
  });
  elKosong.hidden = tampil > 0;
}

inCari.addEventListener("input", terapkanFilter);

// ====== Fungsi bantu ======
const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");

function ambilJumlah(input) {
  const n = parseInt(input.value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

let timerToast;
function tampilToast(pesan, galat = false) {
  elToast.textContent = pesan;
  elToast.classList.toggle("galat", galat);
  elToast.classList.add("tampil");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => elToast.classList.remove("tampil"), 2600);
}

// ====== Perhitungan utama ======
function hitung() {
  let total = 0;

  barisItem.forEach((baris) => {
    const harga = Number(baris.dataset.harga);
    const jumlah = ambilJumlah(baris.querySelector(".qty"));
    const subtotal = harga * jumlah;
    total += subtotal;
    baris.querySelector(".subtotal").textContent = rupiah(subtotal);
    baris.classList.toggle("aktif", jumlah > 0);
  });

  const dapatDiskon = total > BATAS_DISKON;
  const diskon = dapatDiskon ? total * PERSEN_DISKON : 0;
  const setelah = total - diskon;

  elTotal.textContent = rupiah(total);
  elDiskon.textContent = rupiah(diskon);
  elSetelah.textContent = rupiah(setelah);
  elLencana.hidden = !dapatDiskon;

  // info diskon
  elInfo.classList.toggle("dapat", dapatDiskon);
  if (dapatDiskon) {
    elInfo.textContent = "Diskon 5% didapat, hemat " + rupiah(diskon) + ".";
  } else if (total > 0) {
    elInfo.textContent = "Tambah belanja " + rupiah(BATAS_DISKON - total + 1) + " lagi untuk diskon 5%.";
  } else {
    elInfo.textContent = "Belanja di atas Rp 200.000 mendapat diskon 5%.";
  }

  // kembalian
  const bayar = Number(inBayar.value) || 0;
  const selisih = bayar - setelah;
  kotakKmb.classList.remove("cukup", "kurang");

  if (setelah > 0 && bayar > 0 && selisih < 0) {
    elLabelKmb.textContent = "Uang kurang";
    elKembalian.textContent = rupiah(-selisih);
    kotakKmb.classList.add("kurang");
  } else {
    elLabelKmb.textContent = "Jumlah kembalian";
    elKembalian.textContent = rupiah(setelah > 0 && bayar > 0 ? selisih : 0);
    if (setelah > 0 && bayar >= setelah) kotakKmb.classList.add("cukup");
  }

  return { total, diskon, setelah, bayar, selisih };
}

// ====== Tombol + / - (delegasi, karena baris dibuat lewat JS) ======
elDaftarMenu.addEventListener("click", (e) => {
  const btn = e.target.closest(".step");
  if (!btn) return;
  const input = btn.parentElement.querySelector(".qty");
  const sekarang = ambilJumlah(input);
  const baru = btn.dataset.aksi === "tambah" ? sekarang + 1 : Math.max(0, sekarang - 1);
  input.value = baru === 0 ? "" : baru;
  hitung();
});

// Hitung ulang setiap ada input jumlah
elDaftarMenu.addEventListener("input", (e) => {
  if (e.target.classList.contains("qty")) hitung();
});
inBayar.addEventListener("input", hitung);

// ====== Transaksi lagi: kosongkan semua ======
document.getElementById("btnBaru").addEventListener("click", () => {
  document.querySelectorAll(".qty").forEach((i) => (i.value = ""));
  inBayar.value = "";
  elIsiCetak.innerHTML = "";
  inCari.value = "";
  kategoriAktif = "Semua";
  elTab.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-pressed", t.textContent === "Semua"));
  terapkanFilter();
  hitung();
  inCari.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
  tampilToast("Transaksi baru dimulai. Silakan input pesanan.");
});

// ====== Cetak ======
document.getElementById("btnCetak").addEventListener("click", () => {
  const h = hitung();

  if (h.total === 0) {
    tampilToast("Belum ada pesanan. Isi jumlah porsi dulu.", true);
    inCari.focus();
    return;
  }
  if (h.bayar < h.setelah) {
    tampilToast("Uang bayar kurang " + rupiah(h.setelah - h.bayar) + ".", true);
    inBayar.focus();
    return;
  }

  // isi tabel cetak: hanya menu yang dipesan
  elIsiCetak.innerHTML = "";
  const tambahBaris = (html, kelas) => {
    const tr = document.createElement("tr");
    if (kelas) tr.className = kelas;
    tr.innerHTML = html;
    elIsiCetak.appendChild(tr);
  };

  let no = 0;
  barisItem.forEach((baris) => {
    const jumlah = ambilJumlah(baris.querySelector(".qty"));
    if (jumlah === 0) return;
    const harga = Number(baris.dataset.harga);
    no++;
    tambahBaris(
      '<td class="c-no">' + no + '.</td>' +
      '<td>' + baris.dataset.nama + '</td>' +
      '<td class="c-ang">' + rupiah(harga) + '</td>' +
      '<td class="c-jml">' + jumlah + '</td>' +
      '<td class="c-ang">' + rupiah(harga * jumlah) + '</td>'
    );
  });

  const ringkas = (label, nilai, kelas) =>
    tambahBaris('<td colspan="4" class="label">' + label + '</td><td class="c-ang">' + nilai + '</td>', "ringkas " + (kelas || ""));

  ringkas("Total", rupiah(h.total), "awal");
  ringkas("Diskon" + (h.diskon > 0 ? " (5%)" : ""), rupiah(h.diskon));
  ringkas("Total setelah diskon", rupiah(h.setelah), "tebal");
  ringkas("Bayar", rupiah(h.bayar));
  ringkas("Jumlah kembalian", rupiah(h.selisih), "tebal");

  elTgl.textContent = "Dicetak pada " + new Date().toLocaleString("id-ID");

  window.print();
});

// Tampilan awal
renderMenu();
buatTab();
hitung();
inCari.focus();
