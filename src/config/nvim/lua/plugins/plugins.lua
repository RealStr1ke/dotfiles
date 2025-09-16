-- Main Plugin List

-- Disable netrw
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

return {
    -- Plugins
    spec = {
        -- Plenary Neovim Function Library
        {
            "nvim-lua/plenary.nvim",
            lazy = true,
        },

        -- Startup Time
        {
            "dstein64/vim-startuptime",
            cmd = "StartupTime",
        },

        -- Devicons
        { "nvim-tree/nvim-web-devicons" },

        -- Completion w/ sources
        {
            "hrsh7th/nvim-cmp",
            config = function()
                require("plugins.configs.cmp")
            end,
        },
        { "hrsh7th/cmp-buffer" },
        { "hrsh7th/cmp-path" },
        { "hrsh7th/cmp-omni" },
        { "hrsh7th/cmp-emoji" },
        { "hrsh7th/cmp-nvim-lua" },

        -- Snippets
        -- {
        --     "L3MON4D3/LuaSnip",
        --     -- follow latest release.
        --     -- version = "2.*", -- Replace <CurrentMajor> by the latest released major (first number of latest release)
        --     -- install jsregexp (optional!).
        --     build = "make install_jsregexp"
        -- },
        { "saadparwaiz1/cmp_luasnip" },
        { "rafamadriz/friendly-snippets" },

        -- LSP
        { "williamboman/nvim-lsp-installer" },
        { "hrsh7th/cmp-nvim-lsp" },
        { "neovim/nvim-lspconfig" },
        {
            "williamboman/mason.nvim",
            config = function()
                require("mason").setup()
            end,
        },
        { "williamboman/mason-lspconfig.nvim" },
        { "jose-elias-alvarez/null-ls.nvim" },
        { "RRethy/vim-illuminate" },

        -- Which Key (key bindings)
        {
            "folke/which-key.nvim",
            lazy = true,
            init = function()
                vim.o.timeout = true
                vim.o.timeoutlen = 300
            end,
            opts = {}
        },

        -- Sidebar
        {
            "sidebar-nvim/sidebar.nvim",
            config = function()
                require("plugins.configs.sidebar")
            end
        },

        -- Diagnostics
        {
            "folke/trouble.nvim",
            cmd = {
                "Trouble",
                "TroubleToggle",
            },
            keys = "<leader>x",
            config = function()
                require(plugins.trouble)
            end,
        },

        -- Alpha
        {
            "goolord/alpha-nvim",
            config = function()
                require("plugins.configs.alpha")
            end,
        },

		-- Typr
		{
			"nvzone/typr",
			dependencies = "nvzone/volt",
			opts = {},
      cmd = { "Typr", "TyprStats" },
		},

        -- Telescope
        {
            "nvim-telescope/telescope.nvim",
			dependencies = {
				"nvim-telescope/telescope-project.nvim"
			},
            config = function()
                require("plugins.configs.telescope")
            end,
        },

        -- Status Lines
        -- { "romgrk/barbar.nvim" }, -- Barlines
        { 
            "nvim-lualine/lualine.nvim",
            dependencies = {
                {
                    "nvim-tree/nvim-web-devicons",
                    optional = true
                }
            },
            config = function()
                require("plugins.configs.lualine")
            end
        },
        {
            "akinsho/bufferline.nvim",
            version = "*",
            dependencies = {
                { 
                    "nvim-tree/nvim-web-devicons",
                    optional = true
                },
            },
            config = function()
                require("plugins.configs.bufferline")
            end
        },
        -- { 
        --     "rebelot/heirline.nvim",
        --     config = function()
        --         require("plugins.configs.heirline")
        --     end
        -- },

        -- Git
        {
            "lewis6991/gitsigns.nvim",
            config = function()
                require("plugins.configs.gitsigns")
            end,
        },

        -- Colorschemes
        { "navarasu/onedark.nvim" },
        { "sainnhe/edge" },
        { "sainnhe/sonokai" },
        { "sainnhe/gruvbox-material" },
        { "shaunsingh/nord.nvim" },
        { "sainnhe/everforest" },
        { "EdenEast/nightfox.nvim" },
        { "rebelot/kanagawa.nvim" },
        { "catppuccin/nvim", name = "catppuccin" },
        { "rose-pine/neovim", name = "rose-pine" },
        { "olimorris/onedarkpro.nvim" },
        { "tanvirtin/monokai.nvim" },
        { "marko-cerovac/material.nvim" },
        { "folke/tokyonight.nvim" },
        { "lunarvim/darkplus.nvim" },

        -- DAP
        {
            "mfussenegger/nvim-dap",
            config = function()
                require("plugins.configs.dap")
            end,
        },
        { "rcarriga/nvim-dap-ui" },
        { "ravenxrz/DAPInstall.nvim" },

        -- Treesitter
        {
            "nvim-treesitter/nvim-treesitter",
            cmd = {
                "TSUpdate",
            },
            config = function()
                require("plugins.configs.treesitter")
            end,
        },

        -- File tree
        -- {
        --     "nvim-tree/nvim-tree.lua",
        --     dependencies = {
        --         { 
        --             "nvim-tree/nvim-web-devicons",
        --             optional = true
        --         },
        --     },
        --     config = function()
        --         require("plugins.configs.nvim-tree")
        --     end,
        -- },
        {
            "nvim-neo-tree/neo-tree.nvim",
            branch = "v3.x",
            dependencies = {
                "nvim-lua/plenary.nvim",
                "nvim-tree/nvim-web-devicons",
                "MunifTanjim/nui.nvim",
            },
            config = function()
                require("plugins.configs.neo-tree")
            end,
        },
        -- {
        --     "prichrd/netrw.nvim",
        --     config = function()
        --         require("plugins.configs.netrw")
        --     end
        -- },


        -- GitHub Copilot
        -- { "github/copilot.vim" },
        { 
            "zbirenbaum/copilot.lua",
            lazy = true,
            cmd = "Copilot",
            -- build = ":Copilot auth",
            opts = {},
        },

        -- Noice
        {
            "folke/noice.nvim",
            event = "VeryLazy",
            opts = {
                -- add any options here
            },
            dependencies = {
                -- if you lazy-load any plugin below, make sure to add proper `module="..."` entries
                "MunifTanjim/nui.nvim",
                -- OPTIONAL:
                --   `nvim-notify` is only needed, if you want to use the notification view.
                --   If not available, we use `mini` as the fallback
                "rcarriga/nvim-notify",
            },
            config = function()
                require("plugins.configs.noice")
            end,
        },

        -- Miscellaneous
        { "moll/vim-bbye" },
        { "voldikss/vim-floaterm" },
        { "tpope/vim-repeat" },
        -- { "JoosepAlviste/nvim-ts-context-commentstring" },
        -- { 
        --     "echasnovski/mini.nvim", 
        --     version = false 
        -- },
        {
            "windwp/nvim-autopairs",
            config = function()
                require("plugins.configs.autopairs")
            end,
        },
        {
            "numToStr/Comment.nvim",
            config = function()
                require("plugins.configs.comment")
            end,
        },
        {
            "lukas-reineke/indent-blankline.nvim",
            config = function()
                require("plugins.configs.indentline")
            end,
        },
        {
            "ggandor/leap.nvim",
            config = function()
                require("plugins.configs.leap")
            end,
        },
        {
            "folke/flash.nvim",
            lazy = true,
            ---@type Flash.Config
            opts = {},
            -- stylua: ignore
            keys = {
                { "s", mode = { "n", "x", "o" }, function() require("flash").jump() end, desc = "Flash" },
                { "S", mode = { "n", "o", "x" }, function() require("flash").treesitter() end, desc = "Flash Treesitter" },
                { "r", mode = "o", function() require("flash").remote() end, desc = "Remote Flash" },
                { "R", mode = { "o", "x" }, function() require("flash").treesitter_search() end, desc = "Treesitter Search" },
                { "<c-s>", mode = { "c" }, function() require("flash").toggle() end, desc = "Toggle Flash Search" },
            },
        },
        {
            "akinsho/toggleterm.nvim",
            config = function()
                require("plugins.configs.toggleterm")
            end,
        },
        {
            "ahmedkhalf/project.nvim",
            config = function()
                require("plugins.configs.project")
            end,
        },
    },

    -- Settings
    defaults = {
        lazy = false, -- Lazy loading

        -- It's recommended to leave version=false for now, since a lot the plugin that support versioning,
        -- have outdated releases, which may break your Neovim install.
        version = false, -- always use the latest git commit
        -- version = "*", -- try installing the latest stable version for plugins that support semver
    },
    install = {
        -- colorscheme = { "tokyonight", "habamax" }
    },
    checker = {
        enabled = true, -- automatically check for plugin updates
    },
    performance = {
        rtp = {
            -- disable some rtp plugins
            disabled_plugins = {
                "gzip",
                -- "matchit",
                -- "matchparen",
                -- "netrwPlugin",
                "tarPlugin",
                "tohtml",
                "tutor",
                "zipPlugin",
            },
        },
    },
}
