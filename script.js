        // ==========================================
        // 1. SETUP PEMBOLEHUBAH & LAGU
        // ==========================================
        var audio = document.getElementById("laguTema");
        var musicBtn = document.getElementById("musicIcon");
        var isPlaying = false;
        var scrollInterval; // Untuk kawal auto-scroll
        var scrollInterval;  // Untuk kawal pergerakan
        var resumeTimeout;   // Untuk kawal masa menunggu (delay)

        function openInvitation() {
            var cover = document.getElementById('cover');
            cover.classList.add('open');
            
            // 1. Mainkan Lagu
            if (audio) {
                audio.play().catch(function(error) {
                    console.log("Autoplay blocked:", error);
                });
                isPlaying = true;
            }
        
            // 2. Tunjuk Butang Muzik
            if (musicBtn) {
                musicBtn.style.display = "flex";
                musicBtn.classList.add("spin");
            }
            
            initAnimations();
        
            setTimeout(mulaGerakPerlahan, 3000);
        }

        function toggleMusic() {
            if (isPlaying) {
                audio.pause();
                musicBtn.classList.remove("spin");
                musicBtn.style.opacity = "0.5";
                isPlaying = false;
            } else {
                audio.play();
                musicBtn.classList.add("spin");
                musicBtn.style.opacity = "1";
                isPlaying = true;
            }
        }

        // ==========================================
        // 2. FUNGSI POP-UP MODAL (FINAL FIX)
        // ==========================================
        function openModal(modalID) {
            // A. MATIKAN AUTO-SCROLL SERTA-MERTA
            // Supaya background tak bergerak bila user tengah tengok Modal
            clearInterval(scrollInterval);
            clearTimeout(resumeTimeout);
        
            // B. LOGIK ASAL (Tutup modal lain & Buka modal baru)
            document.querySelectorAll('.modal-overlay').forEach(el => {
                if (el.id !== modalID) { 
                    el.classList.remove('active');
                    setTimeout(() => { 
                        if(!el.classList.contains('active')) {
                            el.style.display = 'none'; 
                        }
                    }, 300);
                }
            });
        
            const modal = document.getElementById(modalID);
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('active');
                }, 10);
            }
        }

        function closeModal(modalID) {
            const modal = document.getElementById(modalID);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        
            // C. LOGIK BARU: SAMBUNG SCROLL (KHAS UNTUK PETA)
            // Jika modal yang ditutup adalah 'modalGambarPeta'
            if (modalID === 'modalGambarPeta') {
                console.log("Peta ditutup. Auto-scroll akan bersambung dalam 3 saat...");
                
                // Tunggu 3 saat, kemudian panggil semula fungsi gerak
                setTimeout(function() {
                    // Cek keselamatan: Pastikan tiada modal lain terbuka
                    // (Takut user tutup peta, terus buka RSVP dalam masa 3 saat tu)
                    const isAnyModalOpen = document.querySelector('.modal-overlay.active');
                    
                    if (!isAnyModalOpen) {
                        mulaGerakPerlahan();
                    }
                }, 3000);
            }
        }

        // [PENTING] FUNGSI BARU: KLIK LUAR UNTUK TUTUP
        // Ini akan automatik kesan bila anda tekan kawasan gelap
        window.onclick = function(event) {
            if (event.target.classList.contains('modal-overlay')) {
                // Hantar ID modal tersebut ke fungsi closeModal
                closeModal(event.target.id);
            }
        }

        // ==========================================
        // 3. COUNTDOWN TIMER
        // ==========================================
        // Format: YYYY-MM-DDTHH:mm:ss+Offset
        const weddingDate = new Date("2026-05-30T00:00:00+08:00").getTime();
        const timer = setInterval(function() {
            const now = new Date().getTime();
            const distance = weddingDate - now;
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (document.getElementById("days")) {
                document.getElementById("days").innerHTML = days < 10 ? "0" + days : days;
                document.getElementById("hours").innerHTML = hours < 10 ? "0" + hours : hours;
                document.getElementById("minutes").innerHTML = minutes < 10 ? "0" + minutes : minutes;
                document.getElementById("seconds").innerHTML = seconds < 10 ? "0" + seconds : seconds;
            }

            if (distance < 0) {
                clearInterval(timer);
                // Jika sudah melepasi 1 hari (86400000 ms) dari tarikh majlis
                if (distance < -86400000) { 
                     document.getElementById("countdown").innerHTML = "Majlis Telah Selesai. Terima Kasih!";
                } else {
                     document.getElementById("countdown").innerHTML = "Majlis Sedang Berlangsung!";
                }
            }
        }, 1000);

        // ==========================================
        // 4. GOOGLE SHEET RSVP SCRIPT (HYBRID)
        // ==========================================
        const scriptURL = 'https://script.google.com/macros/s/AKfycbyJdA9pzbQGrDX2USj-b7vFbJveYd_r-8rdA6O7avMRfIqGbBuXh3QjTF0aNeQold7D/exec';

        function setupForm(formId, btnId, msgId) {
            const form = document.getElementById(formId);
            const btn = document.getElementById(btnId);
            const msg = document.getElementById(msgId);

            if (form) {
                form.addEventListener('submit', e => {
                    e.preventDefault();
                    const originalBtnText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hantar...';
                    btn.disabled = true;

                    fetch(scriptURL, { method: 'POST', body: new FormData(form)})
                        .then(response => {
                            if (msg) {
                                msg.style.display = 'block';
                                msg.innerHTML = "Alhamdulillah & Terima Kasih! Kehadiran dan Ucapan anda direkodkan.";
                                msg.style.color = "green";
                                setTimeout(() => { msg.style.display = 'none'; }, 5000);
                            }
                            form.reset();
                            btn.innerHTML = originalBtnText;
                            btn.disabled = false;
                            
                            // ============================================================
                            // 1. TAMBAH KOD INI DI SINI (AUTO REFRESH UCAPAN)
                            // ============================================================
                            // Kita bagi masa 2 saat untuk Google Sheet simpan data, 
                            // kemudian kita panggil semula fungsi loadWishes()
                            setTimeout(() => { 
                                console.log("Mengemaskini senarai ucapan...");
                                loadWishes(); 
                            }, 2000); 
                            // ============================================================
                    
                            if(formId === 'rsvpForm') {
                                setTimeout(() => { closeModal('modalRSVP'); }, 2000);
                            }
                        })
                        .catch(error => {
                            if (msg) {
                                msg.style.display = 'block';
                                msg.innerHTML = "Gagal. Cuba lagi.";
                                msg.style.color = "red";
                            }
                            console.error('Error!', error.message);
                            btn.innerHTML = originalBtnText;
                            btn.disabled = false;
                        });
                });
            }
        }

        setupForm('rsvpForm', 'btnSubmit', 'statusMessage');
        setupForm('rsvpFormMain', 'btnSubmitMain', 'msgMain');

        // ==========================================
        // FUNGSI TARIK UCAPAN DARI GOOGLE SHEET
        // ==========================================
        // Gantikan URL di bawah dengan URL Script App yang BARU awak dapat tadi
        const scriptURL_READ = 'https://script.google.com/macros/s/AKfycbyJdA9pzbQGrDX2USj-b7vFbJveYd_r-8rdA6O7avMRfIqGbBuXh3QjTF0aNeQold7D/exec'; 
        
        function loadWishes() {
            const container = document.getElementById('senaraiUcapan');
            
            fetch(scriptURL_READ)
                .then(response => response.json())
                .then(data => {
                    console.log("Data diterima:", data); 
        
                    if (data.status === 'success' && data.data.length > 0) {
                        container.innerHTML = ''; // Kosongkan text 'loading'
                        
                        // Terbalikkan susunan (ucapan baru di atas)
                        data.data.reverse().forEach(row => {
                            
                            // 1. Tukar data kepada String untuk elak error
                            const namaTetamu = row.Nama ? row.Nama.toString() : "Tetamu";
                            const ucapanTetamu = row.Ucapan ? row.Ucapan.toString() : "";
        
                            // 2. Semak jika ucapan bukan kosong
                            if (ucapanTetamu.trim() !== "") {
                                
                                // --- INI BAHAGIAN PENTING (XSS PROTECTION) ---
                                
                                // A. Cipta kotak kad dulu (Parent)
                                const card = document.createElement('div');
                                card.className = 'wish-card';
        
                                // B. Cipta elemen Nama secara berasingan
                                const nameSpan = document.createElement('span');
                                nameSpan.className = 'wisher-name';
                                nameSpan.textContent = namaTetamu; // <--- Selamat! Dia baca sebagai teks shj
        
                                // C. Cipta elemen Mesej secara berasingan
                                const msgSpan = document.createElement('span');
                                msgSpan.className = 'wisher-message';
                                // Kita tambah tanda petik "" secara manual di sini
                                msgSpan.textContent = `"${ucapanTetamu}"`; // <--- Selamat! 
        
                                // D. Masukkan Nama & Mesej ke dalam Kad
                                card.appendChild(nameSpan);
                                card.appendChild(msgSpan);
                                
                                // E. Masukkan Kad ke dalam Container utama
                                container.appendChild(card);
                            }
                        });
                    } else {
                        container.innerHTML = '<p style="text-align:center;">Belum ada ucapan. Jadilah yang pertama!</p>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching wishes:', error);
                    container.innerHTML = `<p style="text-align:center; color:red;">Gagal memuatkan ucapan.<br><small>Sila cuba sebentar lagi.</small></p>`;
                });
        }
        
        // Panggil fungsi ini bila page dah load
        window.addEventListener('load', loadWishes);

        // ==========================================
        // 5. ANIMASI SCROLL
        // ==========================================
        function initAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-up').forEach((el) => {
                observer.observe(el);
            });
        }

        // ==========================================
        // 6. FUNGSI BUTANG HOME (RUMAH)
        // ==========================================
        function keRumah() {
            // 1. Matikan sebarang scroll/timer yang sedang berjalan (Reset)
            clearInterval(scrollInterval);
            clearTimeout(resumeTimeout);
        
            // 2. Tutup semua modal/pop-up
            document.querySelectorAll('.modal-overlay').forEach(el => {
                el.classList.remove('active');
                setTimeout(() => { el.style.display = 'none'; }, 300);
            });
        
            // 3. Skrol ke paling atas dengan lembut
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        
            console.log("Pulang ke rumah...");
        
            // 4. MULA AUTO-SCROLL SELEPAS 3 SAAT
            // Kita guna setTimeout baru khas untuk fungsi ini
            setTimeout(function() {
                
                // Periksa adakah pengguna masih di bahagian atas?
                // (Elak skrol kalau user dah scroll manual ke bawah dalam masa 3 saat tu)
                if (window.scrollY < 200) { 
                    console.log("Memulakan semula auto-scroll...");
                    mulaGerakPerlahan();
                }
                
            }, 3000); 
        }

        // ==========================================
        // 7. FUNGSI BUTANG RSVP (SKROL KE BORANG)
        // ==========================================
        function pilihMenu(targetId) {
            // 1. Tutup Modal dulu
            closeModal('modalRSVP');
        
            // 2. Tunggu modal tutup (300ms), baru scroll ke tempat yang dituju
            setTimeout(() => {
                const elemen = document.getElementById(targetId);
                if (elemen) {
                    elemen.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' // Pastikan borang duduk tengah-tengah skrin
                    });
                }
            }, 300);
        }

        // ==========================================
        // 8. LOGIK KEHADIRAN (HIDUP/MATI KOTAK JUMLAH)
        // ==========================================
        function aktifkanLogikKehadiran(formId) {
            const borang = document.getElementById(formId);
            
            // Jika borang tak wujud, berhenti (elak error)
            if (!borang) return; 
        
            const statusSelect = borang.querySelector('select[name="Status"]');
            const jumlahSelect = borang.querySelector('select[name="Jumlah"]');
        
            // Pastikan kedua-dua kotak wujud baru jalan kerja
            if (statusSelect && jumlahSelect) {
                
                statusSelect.addEventListener('change', function() {
                    // Jika pilih 'Tidak Hadir'
                    if (this.value === 'Tidak Hadir') {
                        jumlahSelect.value = "";           // Kosongkan pilihan jumlah
                        jumlahSelect.disabled = true;      // Kunci kotak (tak boleh tekan)
                        jumlahSelect.required = false;     // Jadikan tak wajib isi
                        
                        // (Optional) Ubah warna supaya nampak 'mati'
                        jumlahSelect.style.backgroundColor = "#e0e0e0"; 
                        jumlahSelect.style.cursor = "not-allowed";
                    } 
                    // Jika pilih 'Akan Hadir' atau lain-lain
                    else {
                        jumlahSelect.disabled = false;     // Aktifkan semula
                        jumlahSelect.required = true;      // Wajib isi semula
                        
                        // Kembalikan warna asal
                        jumlahSelect.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                        jumlahSelect.style.cursor = "default";
                    }
                });
            }
        }
        
        // Jalankan fungsi ini sebaik sahaja laman web siap loading
        window.addEventListener('load', function() {
            // Panggil untuk borang utama anda
            aktifkanLogikKehadiran('rsvpFormMain');
            
            // Jika anda ada borang lain (contoh: dalam modal), tambah ID di sini:
            // aktifkanLogikKehadiran('rsvpForm'); 
        });

        // ==========================================
        // FUNGSI GERAK PERLAHAN (AUTO SCROLL)
        // ==========================================
        function mulaGerakPerlahan() {
            const kelajuan = 40; 
        
            scrollInterval = setInterval(function() {
                window.scrollBy(0, 1);
        
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    clearInterval(scrollInterval);
                }
            }, kelajuan);
        }
        
        window.addEventListener('touchstart', function() {
            clearInterval(scrollInterval);
        });
        
        window.addEventListener('wheel', function() {
            clearInterval(scrollInterval);
        });
        
        window.addEventListener('click', function() {
            clearInterval(scrollInterval);
        });

        function mulaGerakPerlahan() {
            // 1. Matikan dulu interval lama (jika ada) supaya tak bertindih
            clearInterval(scrollInterval);
        
            // 2. Mula skrol
            // Kelajuan: 40ms (Ubah nombor ini: 30=Laju, 60=Perlahan)
            scrollInterval = setInterval(function() {
                
                // Gerak 1 pixel ke bawah
                window.scrollBy(0, 1);
        
                // Cek: Jika dah sampai ke Hujung Bawah (Footer)
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    // Matikan semua sistem sebab dah habis baca
                    clearInterval(scrollInterval);
                    clearTimeout(resumeTimeout);
                    buangEventListeners(); // Bersihkan memori
                }
        
            }, 40); 
        }
        
        function hentiDanSambung() {
            // 1. Hentikan pergerakan serta-merta bila user sentuh
            clearInterval(scrollInterval);
        
            // 2. Reset timer "menunggu" yang lama (supaya tak keliru)
            clearTimeout(resumeTimeout);
        
            // 3. Set timer baru:
            // "Kalau user diam selama 3 saat, jalan balik."
            resumeTimeout = setTimeout(function() {
                console.log("User senyap (idle). Sambung auto-scroll...");
                mulaGerakPerlahan();
            }, 3000); // 3000ms = 3 saat delay
        }
        
        function pasangAutoScrollListeners() {
            // Bila jari sentuh skrin (Phone)
            window.addEventListener('touchstart', hentiDanSambung);
            // Bila jari bergerak atas skrin (Phone)
            window.addEventListener('touchmove', hentiDanSambung);
            // Bila guna mouse wheel (PC)
            window.addEventListener('wheel', hentiDanSambung);
            // Bila klik mana-mana (PC/Phone)
            window.addEventListener('click', hentiDanSambung);
        }
        
        function buangEventListeners() {
            window.removeEventListener('touchstart', hentiDanSambung);
            window.removeEventListener('touchmove', hentiDanSambung);
            window.removeEventListener('wheel', hentiDanSambung);
            window.removeEventListener('click', hentiDanSambung);
        }
        
        // Panggil fungsi ini sekali sahaja supaya ia bersedia
        pasangAutoScrollListeners();

        // ==========================================
        // FUNGSI KHAS: STOP KEKAL (NAVBAR & RSVP)
        // ==========================================
        // Kita senaraikan elemen yang "Wajib Berhenti" bila disentuh
        const zonLaranganGerak = [
            document.querySelector('.bottom-nav'),  // Menu Bawah
            document.getElementById('rsvp-inline')  // Borang RSVP (Baru tambah)
        ];
        
        const matikanScrollSepenuhnya = function(e) {
            // 1. PENTING: Halang event ini daripada dikesan oleh Window.
            // Ini bermaksud fungsi 'Smart Resume' (sambung balik) TIDAK akan dipanggil.
            e.stopPropagation(); 
        
            // 2. Matikan pergerakan skrin serta-merta
            clearInterval(scrollInterval);
        
            // 3. Batalkan sebarang timer "tunggu 3 saat" yang sedang berjalan
            clearTimeout(resumeTimeout);
        
            console.log("Zon sensitif disentuh. Auto-scroll dimatikan sepenuhnya.");
        };
        
        // Pasang 'trap' pada setiap elemen dalam senarai
        zonLaranganGerak.forEach(elemen => {
            if (elemen) {
                // Matikan bila klik (PC)
                elemen.addEventListener('click', matikanScrollSepenuhnya);
                
                // Matikan bila sentuh (Phone)
                elemen.addEventListener('touchstart', matikanScrollSepenuhnya);
                
                // Matikan bila mula menaip dalam borang (Focus)
                elemen.addEventListener('focusin', matikanScrollSepenuhnya);
            }
        });
