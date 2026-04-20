# 🛒 FamCart (Family Shopping List App)

FamCart เป็นแอปพลิเคชันบนสมาร์ทโฟนที่ออกแบบมาเพื่อช่วยให้คนในครอบครัว (หรือกลุ่มเพื่อน) สามารถจัดการรายการซื้อของเข้าบ้านร่วมกันได้อย่างมีประสิทธิภาพ ตัดปัญหากระดาษจดหาย การซื้อของซ้ำซ้อน หรือลืมของที่ต้องซื้อ ด้วยระบบที่ซิงค์ข้อมูลแบบ Real-time!

## ✨ ฟีเจอร์หลัก (Key Features)

* **🔐 ระบบจัดการบัญชีผู้ใช้:** สมัครสมาชิก, เข้าสู่ระบบ และระบบลืมรหัสผ่านที่ส่งรหัส OTP 6 หลักเข้าอีเมลเพื่อความปลอดภัย
* **👨‍👩‍👧‍👦 ระบบครอบครัว (Family System):**
    * สร้างกลุ่มครอบครัว หรือเข้าร่วมกลุ่มของคนอื่นผ่าน "รหัสผ่านเข้าร่วม (Join Code)"
    * จัดการสมาชิกภายในกลุ่ม
    * สิทธิ์การเข้าถึง: เจ้าของกลุ่มสามารถแก้ไขชื่อและลบกลุ่มได้ ส่วนสมาชิกสามารถกดออกจากกลุ่มได้
* **📝 รายการซื้อของแบบ Real-time:**
    * เพิ่ม แก้ไข และลบรายการสินค้าที่ต้องซื้อ
    * อัปโหลดรูปภาพสินค้าเพื่อป้องกันการซื้อผิดยี่ห้อ
    * ระบุจำนวน, ราคา และหมวดหมู่ของสินค้า
    * **Real-time Sync:** ทุกการเปลี่ยนแปลง (เช่น การกดติ๊ก ✅ ว่าซื้อของแล้ว) หน้าจอของทุกคนในกลุ่มจะอัปเดตพร้อมกันทันทีโดยไม่ต้องรีเฟรช
* **🛍️ ระบบทริปซื้อของ (Shopping Sessions):** จัดกลุ่มรายการของตามการไปห้างแต่ละรอบ เพื่อง่ายต่อการติดตามค่าใช้จ่าย
* **🎨 UI/UX ทันสมัย:** ออกแบบด้วยคอนเซปต์ Modern Minimalist & Glassmorphism ที่ดูสะอาดตาและใช้งานง่าย

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Expo Router)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Authentication:** Supabase Auth (Email & Password, OTP Recovery)
* **Realtime Data:** Supabase Realtime Subscriptions
* **Storage:** Supabase Storage (สำหรับเก็บรูปภาพสินค้า)
* **Icons & Animation:** Expo Vector Icons (Feather), React Native Animated

## 📸 ภาพตัวอย่างแอปพลิเคชัน (Screenshots)

<table>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/33b1f4f6-fd27-4151-b962-086feda5b56c" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/f5df20c3-729e-4df0-b679-9d6af665969e" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/14e0d85f-ca78-4b64-80bb-0f6bf898da94" /></td>
  </tr>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/3626abb2-572f-4ccf-9a38-0f193340b164" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/b34f04eb-2e45-48e7-9d19-b98a6e540f6a" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/2341c0cd-8b8b-4997-9dd3-783c1253c294" /></td>
  </tr>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/d530c9a6-e3a3-4081-9d5e-f2d2fe5b9f66" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/005332c2-e513-42c7-8b5b-6b8935b57f68" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/edf50eb0-1129-49f0-8124-9e7e60334f56" /></td>
  </tr>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/bf241d39-48bd-48df-9294-081771231728" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/a1ec8301-e876-4e89-87fa-91e9cb67f104" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/bba8277b-4b52-4493-a972-ee71c82ab1df" /></td>
  </tr>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/97c79597-9a98-46bc-a3e7-602a2ef42cfc" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/fc4152ed-29a6-4ae4-9833-a09757893324" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/ee435fb3-0da9-421d-9ad0-81b1fc4d883c" /></td>
  </tr>
  <tr>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/92dbe8a4-6a3b-4f9e-be9f-4b2621760f1d" /></td>
    <td><img width="1080" alt="Screenshot" src="https://github.com/user-attachments/assets/c5adcc06-96bc-4276-93ae-66c1885f24f8" /></td>
    <td></td>
  </tr>
</table>


## 👤 ผู้พัฒนา
**Developed by [Kanyada](https://github.com/KanyadaSupan)**
*Student at Southeast Asia University | Digital Technology and Innovation*
