local g = vim.g

local M = {}

function M.defaults()
    vim.opt.guifont = "CaskaydiaCove NF:h17" -- the font used in graphical neovim applications
end

function M.tokyonight()
    g.tokyonight_style = "night"
    g.tokyonight_sidebars = {} -- { "qf", "vista", "terminal", "packer", "NvimTree" , 'Trouble', 'tagbar' }
    vim.cmd("colorscheme tokyonight") -- this has to be specified last
    -- vim.cmd('hi VertSplit guifg=' .. require'colors'.get_color('Visual', 'bg')) -- .. ' guibg=' .. get_color('StatusLine', 'bg'))
end

function M.catppuccin()
    local status_ok, catppuccin = pcall(require, "catppuccin")
    if not status_ok then
        return
    end
    catppuccin.setup({
        flavour = "mocha", -- latte, frappe, macchiato, mocha
        background = { -- :h background
            light = "latte",
            dark = "mocha",
        },
    })
    vim.cmd("colorscheme catppuccin")
end

M.defaults()
M.catppuccin()
-- M.tokyonight()

return M
