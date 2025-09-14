package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/raihan-software/saldoify/internal/models"
	"github.com/raihan-software/saldoify/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// UserService interface defines the contract for user business logic
type UserService interface {
	Register(req *models.CreateUserRequest) (*models.UserResponse, error)
	Login(req *models.LoginRequest) (*models.LoginResponse, error)
	GetUser(id string) (*models.UserResponse, error)
	UpdateUser(id string, req *models.UpdateUserRequest) (*models.UserResponse, error)
	DeleteUser(id string) error
	ListUsers(limit, offset int) ([]*models.UserResponse, int, error)
	ValidateToken(tokenString string) (string, error)
}

// userService implements UserService interface
type userService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

// NewUserService creates a new user service instance
func NewUserService(userRepo repository.UserRepository, jwtSecret string) UserService {
	return &userService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Register creates a new user account
func (s *userService) Register(req *models.CreateUserRequest) (*models.UserResponse, error) {
	// Check if user already exists
	existingUser, _ := s.userRepo.GetByEmail(req.Email)
	if existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Check username uniqueness if provided
	if req.Username != "" {
		existingUser, _ := s.userRepo.GetByUsername(req.Username)
		if existingUser != nil {
			return nil, errors.New("username already taken")
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	var username *string
	if req.Username != "" {
		username = &req.Username
	}

	user := models.NewUser(req.Email, req.Name, string(hashedPassword), username)

	// Save to database
	if err := s.userRepo.Create(user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	response := user.ToResponse()
	return &response, nil
}

// Login authenticates a user and returns a JWT token
func (s *userService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	response := &models.LoginResponse{
		User:  *user,
		Token: token,
	}

	return response, nil
}

// GetUser retrieves a user by ID
func (s *userService) GetUser(id string) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// UpdateUser updates user information
func (s *userService) UpdateUser(id string, req *models.UpdateUserRequest) (*models.UserResponse, error) {
	// Get existing user
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Username != nil {
		// Check username uniqueness if changing
		if *req.Username != "" {
			existingUser, _ := s.userRepo.GetByUsername(*req.Username)
			if existingUser != nil && existingUser.ID != id {
				return nil, errors.New("username already taken")
			}
		}
		user.Username = req.Username
	}

	// Save changes
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// DeleteUser removes a user account
func (s *userService) DeleteUser(id string) error {
	return s.userRepo.Delete(id)
}

// ListUsers retrieves a paginated list of users
func (s *userService) ListUsers(limit, offset int) ([]*models.UserResponse, int, error) {
	users, err := s.userRepo.List(limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userRepo.Count()
	if err != nil {
		return nil, 0, err
	}

	var responses []*models.UserResponse
	for _, user := range users {
		response := user.ToResponse()
		responses = append(responses, &response)
	}

	return responses, total, nil
}

// ValidateToken validates a JWT token and returns the user ID
func (s *userService) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(string)
		if !ok {
			return "", errors.New("invalid token claims")
		}
		return userID, nil
	}

	return "", errors.New("invalid token")
}

// generateToken creates a JWT token for the given user ID
func (s *userService) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
