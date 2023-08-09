local g = vim.g

local M = {}

function M.defaults()
    vim.opt.guifont = "Caskaydia Cove NF:h17" -- the font used in graphical neovim applications
end

function M.tokyonight()
    g.tokyonight_style = "night"
    g.tokyonight_sidebars = {} -- { "qf", "vista", "terminal", "packer", "NvimTree" , 'Trouble', 'tagbar' }
    vim.cmd("colorscheme tokyonight") -- this has to be specified last
    -- vim.cmd('hi VertSplit guifg=' .. require'colors'.get_color('Visual', 'bg')) -- .. ' guibg=' .. get_color('StatusLine', 'bg'))
end

M.defaults()
M.tokyonight()

return M
