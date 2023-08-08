local fn = vim.fn

-- Automatically install packer
local install_path = fn.stdpath("data")..'/site/pack/packer/start/packer.nvim'
if fn.empty(fn.glob(install_path)) > 0 then
  PACKER_BOOTSTRAP = fn.system {
    "git", "clone", "--depth", "1",
    "https://github.com/wbthomason/packer.nvim",
    install_path,
  }
  print "Installing packer close and reopen Neovim..."
  vim.cmd [[packadd packer.nvim]]
end
-- Autocommand that reloads neovim whenever you save the plugins.lua file
vim.cmd [[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost plugins.lua source <afile> | PackerSync
  augroup end
]]

-- Use a protected call so we don't error out on first use
local status_ok, packer = pcall(require, "packer")
if not status_ok then
  return
end

-- Have packer use a popup window
packer.init {
  display = {
    open_fn = function()
      return require("packer.util").float { border = "rounded" }
    end,
  },
  git = {
    clone_timeout = 300, -- Timeout, in seconds, for git clones
  },
}

-- Install your plugins here
return packer.startup(function(use)
  -- DEPRECATED - Load impatient.nvim before any other plugins
  -- use { "lewis6991/impatient.nvim", config = "require('configs.impatient')" }
  vim.loader.enable()

  -- Allow packer to manage itself
  use { "wbthomason/packer.nvim" }
  
  -- CMP w/ sources
  use { "hrsh7th/nvim-cmp", config = "require('configs.cmp')" }
  use { "hrsh7th/cmp-buffer", after = "nvim-cmp" }
  use { "hrsh7th/cmp-path", after = "nvim-cmp" }
  use { "hrsh7th/cmp-omni", after = "nvim-cmp" }
  use { "hrsh7th/cmp-emoji", after = "nvim-cmp" }
  use { "hrsh7th/cmp-nvim-lua", after = "nvim-cmp" }
  use { "saadparwaiz1/cmp_luasnip", after = "nvim-cmp" }

  -- LSP
  use { "williamboman/nvim-lsp-installer" } -- simple to use language server installer
  use { "hrsh7th/cmp-nvim-lsp", after = "nvim-cmp" }
  use { "neovim/nvim-lspconfig", after = "cmp-nvim-lsp" }
  use { "williamboman/mason.nvim", after = "nvim-lspconfig", config = "require('mason').setup()" }
  use { "williamboman/mason-lspconfig.nvim", after = "mason.nvim" }
  use { "jose-elias-alvarez/null-ls.nvim", after = "nvim-lspconfig" }
  use { "RRethy/vim-illuminate", after = "nvim-lspconfig" }

  -- Treesitter
  use { 
    "nvim-treesitter/nvim-treesitter", 
    run = ":TSUpdate", 
    config = "require('configs.treesitter')" 
  }

  -- Telescope
  use { "nvim-telescope/telescope.nvim", config = "require('configs.telescope')" }

  -- Alpha
  use { "goolord/alpha-nvim", config = "require('configs.alpha')" }

  -- Lualine
  use { "nvim-lualine/lualine.nvim", config = "require('configs.lualine')" }

  -- Git
  use { "lewis6991/gitsigns.nvim", config = "require('configs.gitsigns')" }

  -- Colorshemes
  use { "navarasu/onedark.nvim" }
  use { "sainnhe/edge" }
  use { "sainnhe/sonokai" }
  use { "sainnhe/gruvbox-material" }
  use { "shaunsingh/nord.nvim" }
  use { "sainnhe/everforest" }
  use { "EdenEast/nightfox.nvim" }
  use { "rebelot/kanagawa.nvim" }
  use { "catppuccin/nvim", as = "catppuccin" }
  use { "rose-pine/neovim", as = 'rose-pine' }
  use { "olimorris/onedarkpro.nvim" }
  use { "tanvirtin/monokai.nvim" }
  use { "marko-cerovac/material.nvim" }
  use { "folke/tokyonight.nvim" }
  use { "lunarvim/darkplus.nvim" }
  
  
  -- DAP
  -- use { "mfussenegger/nvim-dap", config = "require('configs.dap')" }
  -- use { "rcarriga/nvim-dap-ui", after = "nvim-dap" }
  -- use { "ravenxrz/DAPInstall.nvim", after = "nvim-dap" }

  -- Snippets
  use { "L3MON4D3/LuaSnip" }
  use { "rafamadriz/friendly-snippets" }

  -- File tree
  use { 
    "nvim-tree/nvim-tree.lua", 
    config = "require('configs.nvim-tree')", 
    requires = {
      "nvim-tree/nvim-web-devicons"
    }
  }

  -- GitHub Copilot
  use { "github/copilot.vim" }

  -- Miscellaneous
  use { "moll/vim-bbye" }
  use { "voldikss/vim-floaterm" }
  use { "nvim-lua/plenary.nvim" }
  -- use { "kyazdani42/nvim-web-devicons" }
  use { "JoosepAlviste/nvim-ts-context-commentstring" }
  use { "windwp/nvim-autopairs", config = "require('configs.autopairs')" }
  use { "numToStr/Comment.nvim", config = "require('configs.comment')" }
  use { "lukas-reineke/indent-blankline.nvim", config = "require('configs.indentline')" }
  -- use { "akinsho/bufferline.nvim", config = "require('configs.bufferline')" }
  use { "akinsho/toggleterm.nvim", config = "require('configs.toggleterm')" }
  use { "ahmedkhalf/project.nvim", config = "require('configs.project')" }

  -- Automatically set up your configuration after cloning packer.nvim
  -- Put this at the end after all plugins
  if PACKER_BOOTSTRAP then
    require("packer").sync()
  end
end)
