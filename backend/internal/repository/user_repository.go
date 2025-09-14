package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/raihan-software/saldoify/db"
	"github.com/raihan-software/saldoify/internal/database"
	"github.com/raihan-software/saldoify/internal/models"
)

// UserRepository interface defines the contract for user data operations
type UserRepository interface {
	Create(user *models.User) error
	GetByID(id string) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	GetByUsername(username string) (*models.User, error)
	Update(user *models.User) error
	Delete(id string) error
	List(limit, offset int) ([]*models.User, error)
	Count() (int, error)
}

// userRepository implements UserRepository interface
type userRepository struct {
	queries *db.Queries
}

// NewUserRepository creates a new user repository instance
func NewUserRepository() UserRepository {
	return &userRepository{
		queries: database.Queries,
	}
}

// Create inserts a new user into the database
func (r *userRepository) Create(user *models.User) error {
	ctx := context.Background()

	params := &db.CreateUserParams{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Username:     user.Username,
		PasswordHash: user.PasswordHash,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}

	_, err := r.queries.CreateUser(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *userRepository) GetByID(id string) (*models.User, error) {
	ctx := context.Background()

	dbUser, err := r.queries.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return convertDBUserToModel(dbUser), nil
}

// GetByEmail retrieves a user by email
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
	ctx := context.Background()

	dbUser, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return convertDBUserToModel(dbUser), nil
}

// GetByUsername retrieves a user by username
func (r *userRepository) GetByUsername(username string) (*models.User, error) {
	ctx := context.Background()

	dbUser, err := r.queries.GetUserByUsername(ctx, &username)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	return convertDBUserToModel(dbUser), nil
}

// Update updates an existing user
func (r *userRepository) Update(user *models.User) error {
	ctx := context.Background()

	user.UpdatedAt = time.Now()
	params := &db.UpdateUserParams{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Username:     user.Username,
		PasswordHash: user.PasswordHash,
		UpdatedAt:    user.UpdatedAt,
	}

	_, err := r.queries.UpdateUser(ctx, params)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

// Delete removes a user by ID
func (r *userRepository) Delete(id string) error {
	ctx := context.Background()

	err := r.queries.DeleteUser(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// List retrieves a paginated list of users
func (r *userRepository) List(limit, offset int) ([]*models.User, error) {
	ctx := context.Background()

	params := &db.ListUsersParams{
		Limit:  int32(limit),
		Offset: int32(offset),
	}

	dbUsers, err := r.queries.ListUsers(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	users := make([]*models.User, len(dbUsers))
	for i, dbUser := range dbUsers {
		users[i] = convertDBUserToModel(dbUser)
	}

	return users, nil
}

// Count returns the total number of users
func (r *userRepository) Count() (int, error) {
	ctx := context.Background()

	count, err := r.queries.CountUsers(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to count users: %w", err)
	}

	return int(count), nil
}

// convertDBUserToModel converts a db.User to models.User
func convertDBUserToModel(dbUser *db.User) *models.User {
	return &models.User{
		ID:           dbUser.ID,
		Email:        dbUser.Email,
		Name:         dbUser.Name,
		Username:     dbUser.Username,
		PasswordHash: dbUser.PasswordHash,
		CreatedAt:    dbUser.CreatedAt,
		UpdatedAt:    dbUser.UpdatedAt,
	}
}
