ช่วยเขียน TODO สำหรับโปรเจค /Users/marosdeeuma/play-game-nextjs

เว็บเกมออนไลน์ เอาไว้ p2p เล่นกับเพื่อนหลายๆ เกม ช่วยลิสต์รายการเกมทั้งหมด แยกตาม category ให้ด้วยคับ

ตามข้อมูลเกมที่มีอยู่ในไฟล์ /Users/marosdeeuma/play-game-nextjs/prompt/games.json

โดยทุกครั้งที่สร้าง page.tsx ต้องทำตาม rule ที่เขียนไว้ที่ /Users/marosdeeuma/play-game-nextjs/prompt/CREATE_PAGE_PATTERN.md

โดยเราจะทำ phase 1 ด้วย peerjs (p2p ไม่เน้น security) และ react-three

ทุกเกมจะวาด Canvas ให้ด้วย react-three และใช้ rapier physics

ต้องมีหน้า landing และหน้าอื่นๆ ที่คิดว่าต้องมี เช่น หน้ารวมเกม

ไม่ต้องมี login แต่ให้ทำระบบ สร้าง user เพื่อข้อมูลลง local ด้วย zustand persist ด้วย localforage

ไม่ต้องมี database ให้สามารถเล่นได้เลย ทุกอย่างผ่าน peerjs (peer 2 peer)

เริ่มพัฒนาโปรเจคอันดับแรกเลย ต้องสร้างหน้า MainLayout พร้อม Header Footer และใส่ Theme Toggle เพื่อทำ dark mode

เราจะต่อ phase 2 มาใช้ game server โดย colyseus และค่อยเก็บข้อมูลง db ด้วย supabase และมีระบบ login ด้วย supabase auth (ยังไม่รุ้ว่าจะทำตอนไหน อาจจะไม่ทำก็ได้)
