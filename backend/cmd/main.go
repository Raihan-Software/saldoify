package main

import (
	"log"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/raihan-software/saldoify/docs"
	"github.com/raihan-software/saldoify/internal/database"
	"github.com/raihan-software/saldoify/internal/handler"
	authMiddleware "github.com/raihan-software/saldoify/internal/middleware"
	"github.com/raihan-software/saldoify/internal/repository"
	"github.com/raihan-software/saldoify/internal/service"
	"github.com/raihan-software/saldoify/internal/utils"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title Saldoify API
// @version 1.0
// @description A personal finance management API
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	// Initialize Echo
	app := echo.New()

	// Custom validator
	app.Validator = utils.NewValidator()

	// Middleware
	app.Use(middleware.Recover())
	app.Use(middleware.Logger())
	app.Use(middleware.Secure())
	app.Use(middleware.CORS())

	// Initialize dependencies
	userRepo := repository.NewUserRepository()
	liquidAssetRepo := repository.NewLiquidAssetRepository()
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key")
	userService := service.NewUserService(userRepo, jwtSecret)
	liquidAssetService := service.NewLiquidAssetService(liquidAssetRepo)
	userHandler := handler.NewUserHandler(userService)
	liquidAssetHandler := handler.NewLiquidAssetHandler(liquidAssetService)

	// Swagger documentation
	docs.SwaggerInfo.Host = getEnv("HOST", "localhost:8080")
	app.GET("/swagger/*", echoSwagger.WrapHandler)

	// Health check
	app.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	// API routes
	api := app.Group("/api/v1")

	// Public routes (no authentication required)
	api.POST("/users/register", userHandler.Register)
	api.POST("/users/login", userHandler.Login)

	// Protected routes (authentication required)
	protected := api.Group("")
	protected.Use(authMiddleware.AuthMiddleware(userService))

	protected.GET("/users/profile", userHandler.GetProfile)
	protected.GET("/users/:id", userHandler.GetUser)
	protected.PUT("/users/:id", userHandler.UpdateUser)
	protected.DELETE("/users/:id", userHandler.DeleteUser)
	protected.GET("/users", userHandler.ListUsers)

	// Liquid Assets routes
	protected.POST("/liquid-assets", liquidAssetHandler.CreateAsset)
	protected.GET("/liquid-assets", liquidAssetHandler.ListAssets)
	protected.GET("/liquid-assets/total", liquidAssetHandler.GetTotalValue)
	protected.GET("/liquid-assets/type/:type", liquidAssetHandler.GetAssetsByType)
	protected.GET("/liquid-assets/:id", liquidAssetHandler.GetAsset)
	protected.PUT("/liquid-assets/:id", liquidAssetHandler.UpdateAsset)
	protected.DELETE("/liquid-assets/:id", liquidAssetHandler.DeleteAsset)

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	log.Printf("Swagger documentation available at http://localhost:%s/swagger/index.html", port)

	if err := app.Start(":" + port); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

// getEnv gets an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
