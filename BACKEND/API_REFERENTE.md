# 🔌 Referência Completa da API

## Base URL
```
http://localhost:3001
```

## Headers Padrão
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
x-age-confirmed: true
```

---

## 🔐 Autenticação

### POST `/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min: 6)",
  "language": "string (optional, default: 'en')",
  "country": "string (optional)",
  "ageConfirmed": "boolean (required, must be true)"
}
```

**Response 201:**
```json
{
  "message": "Usuário criado com sucesso. Verifique seu email para ativar a conta.",
  "userId": 1
}
```

**Response 409:**
```json
{
  "error": "Email já cadastrado!"
}
```

### POST `/auth/login`
Autentica um usuário.

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "isPremium": false,
    "isVerified": true,
    "language": "pt",
    "country": "BR"
  }
}
```

**Response 401:**
```json
{
  "error": "Credenciais incorretas!"
}
```

### POST `/auth/verify-email`
Verifica o email do usuário.

**Request:**
```json
{
  "token": "string (required)"
}
```

**Response 200:**
```json
{
  "message": "Email verificado com sucesso!",
  "token": "new_jwt_token",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "isPremium": false,
    "isVerified": true
  }
}
```

### POST `/auth/forgot-password`
Solicita redefinição de senha.

**Request:**
```json
{
  "email": "string (required)"
}
```

**Response 200:**
```json
{
  "message": "Email de redefinição enviado"
}
```

### POST `/auth/reset-password`
Redefine a senha do usuário.

**Request:**
```json
{
  "token": "string (required)",
  "password": "string (required, min: 6)"
}
```

**Response 200:**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

### GET `/auth/dashboard`
Retorna dados do usuário logado.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "isVerified": true,
  "language": "pt",
  "country": "BR",
  "ageConfirmed": true,
  "lastLoginAt": "2024-01-01T10:00:00.000Z",
  "isPremium": false,
  "isAdmin": false,
  "expiredPremium": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

### PUT `/auth/profile`
Atualiza perfil do usuário.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request:**
```json
{
  "name": "string (optional)",
  "language": "string (optional)",
  "country": "string (optional)"
}
```

**Response 200:**
```json
{
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva Atualizado",
    "email": "joao@email.com",
    "language": "en",
    "country": "US"
  }
}
```

---

## 👥 Modelos

### GET `/models`
Lista modelos com filtros e paginação.

**Headers:**
```
x-age-confirmed: true
```

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 20, max: 100)
ethnicity: enum ['arab', 'asian', 'ebony', 'indian', 'latina', 'white']
language: string
tags: array of strings
sortBy: enum ['recent', 'popular', 'oldest', 'random'] (default: 'recent')
search: string
minAge: integer (min: 18)
maxAge: integer (max: 65)
hairColor: string
eyeColor: string
bodyType: string
```

**Response 200:**
```json
{
  "models": [
    {
      "id": 1,
      "name": "Maria Silva",
      "photoUrl": "https://example.com/photo.jpg",
      "bio": "Biografia da modelo...",
      "hairColor": "Blonde",
      "eyeColor": "Blue",
      "bodyType": "Slim",
      "bustSize": "36C",
      "height": 165,
      "weight": 55,
      "age": 25,
      "birthPlace": "São Paulo, Brasil",
      "ethnicity": "latina",
      "orientation": "Heterosexual",
      "tags": ["tag1", "tag2"],
      "views": 1500,
      "slug": "maria-silva-abc123",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "contents": [
        {
          "id": 1,
          "type": "video"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20
  }
}
```

### GET `/models/:slug`
Detalhes de um modelo específico.

**Headers:**
```
x-age-confirmed: true
Authorization: Bearer {jwt_token} (optional, for history tracking)
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Maria Silva",
  "photoUrl": "https://example.com/photo.jpg",
  "bio": "Biografia completa da modelo...",
  "hairColor": "Blonde",
  "eyeColor": "Blue",
  "bodyType": "Slim",
  "bustSize": "36C",
  "height": 165,
  "weight": 55,
  "age": 25,
  "birthPlace": "São Paulo, Brasil",
  "ethnicity": "latina",
  "orientation": "Heterosexual",
  "tags": ["tag1", "tag2", "tag3"],
  "views": 1501,
  "slug": "maria-silva-abc123",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "contents": [
    {
      "id": 1,
      "title": "Vídeo Especial",
      "url": "https://example.com/video1",
      "thumbnailUrl": "https://example.com/thumb1.jpg",
      "type": "video",
      "tags": ["tag1"],
      "views": 500,
      "status": "active",
      "language": "pt",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/models`
Cria um novo modelo (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Request:**
```json
{
  "name": "string (required)",
  "photoUrl": "string (required)",
  "bio": "string (optional)",
  "hairColor": "string (optional)",
  "eyeColor": "string (optional)",
  "bodyType": "string (optional)",
  "bustSize": "string (optional)",
  "height": "integer (optional)",
  "weight": "integer (optional)",
  "age": "integer (optional)",
  "birthPlace": "string (optional)",
  "ethnicity": "enum (optional)",
  "orientation": "string (optional)",
  "tags": "array (optional)"
}
```

**Response 201:**
```json
{
  "id": 2,
  "name": "Nova Modelo",
  "photoUrl": "https://example.com/photo2.jpg",
  "slug": "nova-modelo-def456",
  "views": 0,
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### PUT `/models/:id`
Atualiza um modelo (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Request:**
```json
{
  "name": "string (optional)",
  "bio": "string (optional)",
  "age": "integer (optional)"
}
```

### DELETE `/models/:id`
Desativa um modelo (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Response 204:** (No Content)

### GET `/models/user/history`
Histórico de modelos visualizados pelo usuário.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 20)
action: enum ['view', 'like', 'share', 'download'] (optional)
```

**Response 200:**
```json
{
  "history": [
    {
      "id": 1,
      "userId": 1,
      "modelId": 1,
      "contentId": null,
      "action": "view",
      "metadata": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "model": {
        "id": 1,
        "name": "Maria Silva",
        "photoUrl": "https://example.com/photo.jpg",
        "slug": "maria-silva-abc123"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

## 📱 Conteúdo

### GET `/content/model/:modelId`
Lista conteúdos de um modelo específico.

**Headers:**
```
x-age-confirmed: true
```

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 20)
type: enum ['video', 'image', 'gallery'] (optional)
tags: array of strings (optional)
sortBy: enum ['recent', 'popular', 'oldest'] (default: 'recent')
```

**Response 200:**
```json
{
  "contents": [
    {
      "id": 1,
      "modelId": 1,
      "title": "Vídeo Especial",
      "url": "https://example.com/video",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "type": "video",
      "tags": ["tag1", "tag2"],
      "views": 250,
      "status": "active",
      "language": "pt",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "model": {
        "id": 1,
        "name": "Maria Silva",
        "slug": "maria-silva-abc123"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### GET `/content/:id`
Detalhes de um conteúdo específico.

**Headers:**
```
x-age-confirmed: true
```

**Response 200:**
```json
{
  "id": 1,
  "modelId": 1,
  "title": "Vídeo Especial",
  "url": "https://example.com/video",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "type": "video",
  "tags": ["tag1", "tag2"],
  "views": 250,
  "status": "active",
  "language": "pt",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "model": {
    "id": 1,
    "name": "Maria Silva",
    "photoUrl": "https://example.com/photo.jpg",
    "slug": "maria-silva-abc123"
  }
}
```

### POST `/content`
Cria novo conteúdo (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Request:**
```json
{
  "modelId": "integer (required)",
  "title": "string (required)",
  "url": "string (required)",
  "thumbnailUrl": "string (optional)",
  "type": "enum (required)",
  "tags": "array (optional)",
  "language": "string (optional)"
}
```

### POST `/content/:id/view`
Registra visualização de conteúdo.

**Headers:**
```
x-age-confirmed: true
Authorization: Bearer {jwt_token} (optional, for history tracking)
```

**Response 200:**
```json
{
  "message": "Visualização registrada",
  "views": 251
}
```

### POST `/content/:id/share`
Compartilha conteúdo.

**Headers:**
```
x-age-confirmed: true
Authorization: Bearer {jwt_token} (optional, for history tracking)
```

**Request:**
```json
{
  "platform": "string (required)"
}
```

**Response 200:**
```json
{
  "shareUrl": "https://site.com/model/maria-silva-abc123?content=1",
  "shareText": "Confira Vídeo Especial - Maria Silva",
  "platform": "twitter"
}
```

---

## 🚨 Denúncias

### POST `/reports`
Cria uma denúncia.

**Headers:**
```
Authorization: Bearer {jwt_token} (optional)
```

**Request:**
```json
{
  "contentId": "integer (optional)",
  "modelId": "integer (optional)",
  "reason": "enum (required) ['broken_link', 'child_content', 'no_consent', 'spam', 'inappropriate', 'other']",
  "description": "string (optional)"
}
```

**Response 201:**
```json
{
  "message": "Denúncia registrada com sucesso",
  "reportId": 1
}
```

### GET `/reports`
Lista denúncias (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Query Parameters:**
```
page: integer (default: 1)
limit: integer (default: 20)
status: enum ['pending', 'reviewed', 'resolved', 'dismissed'] (optional)
reason: enum ['broken_link', 'child_content', 'no_consent', 'spam', 'inappropriate', 'other'] (optional)
sortBy: enum ['recent', 'oldest'] (default: 'recent')
```

**Response 200:**
```json
{
  "reports": [
    {
      "id": 1,
      "contentId": 1,
      "modelId": null,
      "userId": 1,
      "reason": "broken_link",
      "description": "O link não está funcionando",
      "status": "pending",
      "ipAddress": "192.168.1.1",
      "reviewedAt": null,
      "reviewedBy": null,
      "adminNotes": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z",
      "content": {
        "id": 1,
        "title": "Vídeo Especial",
        "url": "https://example.com/video",
        "status": "active"
      },
      "user": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@email.com"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 50,
    "itemsPerPage": 20
  }
}
```

### PUT `/reports/:id`
Atualiza status de denúncia (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Request:**
```json
{
  "status": "enum (required) ['pending', 'reviewed', 'resolved', 'dismissed']",
  "adminNotes": "string (optional)"
}
```

**Response 200:**
```json
{
  "message": "Status da denúncia atualizado",
  "report": {
    "id": 1,
    "status": "resolved",
    "adminNotes": "Link foi corrigido",
    "reviewedAt": "2024-01-01T15:00:00.000Z",
    "reviewedBy": 2
  }
}
```

### GET `/reports/stats`
Estatísticas de denúncias (Admin apenas).

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
```

**Response 200:**
```json
{
  "byReason": [
    {
      "reason": "broken_link",
      "count": "25"
    },
    {
      "reason": "inappropriate",
      "count": "10"
    }
  ],
  "byStatus": [
    {
      "status": "pending",
      "count": "15"
    },
    {
      "status": "resolved",
      "count": "20"
    }
  ]
}
```

---

## 🔞 Verificação de Idade

### POST `/age-verification/confirm`
Confirma que o usuário tem 18+ anos.

**Request:**
```json
{
  "confirmed": "boolean (required, must be true)",
  "birthDate": "string (optional, format: YYYY-MM-DD)"
}
```

**Response 200:**
```json
{
  "message": "Age confirmed successfully",
  "ageConfirmed": true,
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

**Response 403:**
```json
{
  "error": "You must be 18 years or older to access this content"
}
```

### GET `/age-verification/status`
Verifica status da confirmação de idade.

**Response 200:**
```json
{
  "ageConfirmed": true,
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### POST `/age-verification/revoke`
Revoga confirmação de idade.

**Response 200:**
```json
{
  "message": "Age confirmation revoked",
  "ageConfirmed": false
}
```

---

## 🌍 Internacionalização

### GET `/i18n/languages`
Lista todos os idiomas suportados.

**Response 200:**
```json
{
  "en": { "name": "English", "country": "US", "flag": "🇺🇸" },
  "en-CA": { "name": "English", "country": "Canada", "flag": "🇨🇦" },
  "en-IN": { "name": "English", "country": "India", "flag": "🇮🇳" },
  "en-GB": { "name": "English", "country": "United Kingdom", "flag": "🇬🇧" },
  "en-AU": { "na