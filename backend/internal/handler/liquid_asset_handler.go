package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/raihan-software/saldoify/internal/models"
	"github.com/raihan-software/saldoify/internal/service"
)

// LiquidAssetHandler handles HTTP requests for liquid asset operations
type LiquidAssetHandler struct {
	assetService service.LiquidAssetService
}

// NewLiquidAssetHandler creates a new liquid asset handler instance
func NewLiquidAssetHandler(assetService service.LiquidAssetService) *LiquidAssetHandler {
	return &LiquidAssetHandler{
		assetService: assetService,
	}
}

// CreateAsset godoc
// @Summary Create a new liquid asset
// @Description Create a new liquid asset for the authenticated user
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param asset body models.CreateLiquidAssetRequest true "Liquid asset data"
// @Success 201 {object} models.LiquidAssetResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets [post]
func (h *LiquidAssetHandler) CreateAsset(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req models.CreateLiquidAssetRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	asset, err := h.assetService.CreateAsset(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create liquid asset",
		})
	}

	return c.JSON(http.StatusCreated, asset)
}

// GetAsset godoc
// @Summary Get liquid asset by ID
// @Description Retrieve a specific liquid asset by ID
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param id path string true "Asset ID"
// @Success 200 {object} models.LiquidAssetResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets/{id} [get]
func (h *LiquidAssetHandler) GetAsset(c echo.Context) error {
	userID := c.Get("user_id").(string)
	assetID := c.Param("id")

	if assetID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Asset ID is required",
		})
	}

	asset, err := h.assetService.GetAsset(userID, assetID)
	if err != nil {
		if err.Error() == "asset not found" {
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": err.Error(),
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get liquid asset",
		})
	}

	return c.JSON(http.StatusOK, asset)
}

// UpdateAsset godoc
// @Summary Update liquid asset
// @Description Update an existing liquid asset
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param id path string true "Asset ID"
// @Param asset body models.UpdateLiquidAssetRequest true "Liquid asset update data"
// @Success 200 {object} models.LiquidAssetResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets/{id} [put]
func (h *LiquidAssetHandler) UpdateAsset(c echo.Context) error {
	userID := c.Get("user_id").(string)
	assetID := c.Param("id")

	if assetID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Asset ID is required",
		})
	}

	var req models.UpdateLiquidAssetRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if err := c.Validate(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	asset, err := h.assetService.UpdateAsset(userID, assetID, &req)
	if err != nil {
		if err.Error() == "asset not found" {
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": err.Error(),
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to update liquid asset",
		})
	}

	return c.JSON(http.StatusOK, asset)
}

// DeleteAsset godoc
// @Summary Delete liquid asset
// @Description Delete a liquid asset
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param id path string true "Asset ID"
// @Success 204 "Asset deleted successfully"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets/{id} [delete]
func (h *LiquidAssetHandler) DeleteAsset(c echo.Context) error {
	userID := c.Get("user_id").(string)
	assetID := c.Param("id")

	if assetID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Asset ID is required",
		})
	}

	err := h.assetService.DeleteAsset(userID, assetID)
	if err != nil {
		if err.Error() == "asset not found" {
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": err.Error(),
			})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to delete liquid asset",
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// ListAssets godoc
// @Summary List liquid assets
// @Description Get a paginated list of liquid assets for the authenticated user
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param limit query int false "Number of assets to return (default: 10, max: 100)"
// @Param offset query int false "Number of assets to skip (default: 0)"
// @Success 200 {object} models.LiquidAssetsListResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets [get]
func (h *LiquidAssetHandler) ListAssets(c echo.Context) error {
	userID := c.Get("user_id").(string)

	// Parse query parameters
	limitStr := c.QueryParam("limit")
	offsetStr := c.QueryParam("offset")

	limit := 10 // default
	offset := 0 // default

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	response, err := h.assetService.ListAssets(userID, limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to list liquid assets",
		})
	}

	return c.JSON(http.StatusOK, response)
}

// GetAssetsByType godoc
// @Summary Get liquid assets by type
// @Description Get all liquid assets of a specific type for the authenticated user
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Param type path string true "Asset type (cash, savings, checking, investment, crypto)"
// @Success 200 {array} models.LiquidAssetResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets/type/{type} [get]
func (h *LiquidAssetHandler) GetAssetsByType(c echo.Context) error {
	userID := c.Get("user_id").(string)
	assetType := c.Param("type")

	if assetType == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Asset type is required",
		})
	}

	assets, err := h.assetService.GetAssetsByType(userID, assetType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get liquid assets by type",
		})
	}

	return c.JSON(http.StatusOK, assets)
}

// GetTotalValue godoc
// @Summary Get total value of liquid assets
// @Description Get the total value of all liquid assets for the authenticated user
// @Tags liquid-assets
// @Accept json
// @Produce json
// @Success 200 {object} models.LiquidAssetResponse
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /liquid-assets/total [get]
func (h *LiquidAssetHandler) GetTotalValue(c echo.Context) error {
	userID := c.Get("user_id").(string)

	totalValue, err := h.assetService.GetTotalValue(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get total value",
		})
	}

	return c.JSON(http.StatusOK, totalValue)
}
