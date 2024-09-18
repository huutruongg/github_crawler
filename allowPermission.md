
### Quy Trình Triển Khai

#### 1. **Đăng ký Ứng dụng OAuth với GitHub**

Trước tiên, bạn cần đăng ký ứng dụng của mình với GitHub để nhận `Client ID` và `Client Secret`. Đây là các bước:

1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers).
2. Chọn "New OAuth App".
3. Cung cấp thông tin về ứng dụng của bạn và thiết lập URL quay lại (redirect URL) mà GitHub sẽ sử dụng để gửi mã xác nhận (authorization code).
4. Lưu lại `Client ID` và `Client Secret`.

#### 2. **Cấu hình Backend để Xử lý Xác thực OAuth**

**a. Route Đăng Nhập**

Tạo một route để chuyển hướng người dùng đến GitHub để đăng nhập và cấp quyền.

```javascript
const express = require('express');
const app = express();

const clientId = 'your_client_id'; // Replace with your GitHub Client ID
const redirectUri = 'http://localhost:3000/auth/github/callback'; // Replace with your redirect URI

// Route to start OAuth flow
app.get('/auth/github', (req, res) => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;
    res.redirect(authUrl);
});
```

**b. Route Xử lý Callback**

Khi người dùng cấp quyền, GitHub sẽ chuyển hướng đến URI quay lại của bạn với mã xác nhận. Xử lý mã này để lấy token.

```javascript
const axios = require('axios');

app.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code;
    const clientSecret = 'your_client_secret'; // Replace with your GitHub Client Secret

    try {
        // Exchange code for access token
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: redirectUri
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const accessToken = response.data.access_token;

        // Save the access token for later use
        // You might want to save it in a database or session
        res.json({ accessToken });
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error processing your request');
    }
});
```

#### 3. **Sử dụng Token để Truy Cập Repository**

Sử dụng token để truy cập các repository private của ứng viên.

```javascript
const token = 'user_access_token'; // Replace with the user's access token

async function fetchPrivateRepos(token) {
    try {
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}
```

### 4. **Cập Nhật Frontend**

**a. Nút "Cấp quyền truy cập"**

Trên giao diện người dùng, bạn sẽ cần một nút để khởi chạy quy trình OAuth.

```html
<button onclick="window.location.href='/auth/github'">Cấp quyền truy cập đến GitHub của bạn</button>
```

**b. Xử lý Token và Hiển Thị Dữ Liệu**

Sau khi nhận được token từ backend, bạn có thể sử dụng nó để thực hiện các yêu cầu đến GitHub API và hiển thị dữ liệu cho người dùng.

### Tóm Tắt

- **Đăng ký ứng dụng** với GitHub để nhận `Client ID` và `Client Secret`.
- **Thiết lập backend** để xử lý xác thực OAuth và nhận token.
- **Tạo nút** trên giao diện người dùng để bắt đầu quy trình OAuth.
- **Sử dụng token** để truy cập và làm việc với các repository private của ứng viên.

Hãy đảm bảo bảo mật thông tin và token của người dùng và tuân thủ các quy định về quyền riêng tư và bảo mật dữ liệu.