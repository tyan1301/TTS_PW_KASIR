// ====== Pengaturan ======
const BATAS_DISKON = 200000;   // diskon berlaku jika total LEBIH dari angka ini
const PERSEN_DISKON = 0.05;    // 5%

// ====== Elemen ======
const barisItem   = document.querySelectorAll(".item");
const elTotal     = document.getElementById("total");
const elDiskon    = document.getElementById("diskon");
const elSetelah   = document.getElementById("setelah");
const elLencana   = document.getElementById("lencana");
const inBayar     = document.getElementById("bayar");
const elKembalian = document.getElementById("kembalian");
const elLabelKmb  = document.getElementById("labelKembalian");
const kotakKmb    = document.getElementById("kotakKembalian");
const elInfo      = document.getElementById("infoDiskon");
const elDaftar    = document.getElementById("isiDaftar");
const elTgl       = document.getElementById("tglCetak");
const elToast     = document.getElementById("toast");

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

// ====== Tombol + / - ======
document.querySelectorAll(".step").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector(".qty");
    const sekarang = ambilJumlah(input);
    const baru = btn.dataset.aksi === "tambah" ? sekarang + 1 : Math.max(0, sekarang - 1);
    input.value = baru === 0 ? "" : baru;
    hitung();
  });
});

// Hitung ulang setiap ada input
document.querySelectorAll(".qty").forEach((i) => i.addEventListener("input", hitung));
inBayar.addEventListener("input", hitung);

// ====== Transaksi lagi: kosongkan semua ======
document.getElementById("btnBaru").addEventListener("click", () => {
  document.querySelectorAll(".qty").forEach((i) => (i.value = ""));
  inBayar.value = "";
  elDaftar.innerHTML = "";
  hitung();
  document.querySelector(".qty").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
  tampilToast("Transaksi baru dimulai. Silakan input pesanan.");
});

// ====== Cetak ======
document.getElementById("btnCetak").addEventListener("click", () => {
  const h = hitung();

  if (h.total === 0) {
    tampilToast("Belum ada pesanan. Isi jumlah porsi dulu.", true);
    document.querySelector(".qty").focus();
    return;
  }
  if (h.bayar < h.setelah) {
    tampilToast("Uang bayar kurang " + rupiah(h.setelah - h.bayar) + ".", true);
    inBayar.focus();
    return;
  }

  // isi bagian "Menu yang dibeli"
  elDaftar.innerHTML = "";
  barisItem.forEach((baris) => {
    const jumlah = ambilJumlah(baris.querySelector(".qty"));
    if (jumlah > 0) {
      const li = document.createElement("li");
      const subtotal = Number(baris.dataset.harga) * jumlah;
      li.textContent = baris.dataset.nama + " (" + jumlah + " porsi) : " + subtotal.toLocaleString("id-ID");
      elDaftar.appendChild(li);
    }
  });
  elTgl.textContent = "Dicetak pada " + new Date().toLocaleString("id-ID");

  window.print();
});

// Tampilan awal
hitung();
document.querySelector(".qty").focus();
