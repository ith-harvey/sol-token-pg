
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3, 
        Metadata,
    },
};

declare_id!("BtrNTqruuMtwDqWd8ChBx5ckXYmdWuoeFEaYbwp5TasW");

#[program]
pub mod test_sol_token_pg {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        msg!("Creating metadata account");

        // Cross Program Invocation (CPI)
        // Invoking the create_metadata_account_v3 instruction on the token metadata program
        // create_metadata_accounts_v3(
        //     CpiContext::new(
        //         ctx.accounts.token_metadata_program.to_account_info(),
        //         CreateMetadataAccountsV3 {
        //             metadata: ctx.accounts.metadata_account.to_account_info(),
        //             mint: ctx.accounts.mint_account.to_account_info(),
        //             mint_authority: ctx.accounts.payer.to_account_info(),
        //             update_authority: ctx.accounts.payer.to_account_info(),
        //             payer: ctx.accounts.payer.to_account_info(),
        //             system_program: ctx.accounts.system_program.to_account_info(),
        //             rent: ctx.accounts.rent.to_account_info(),
        //         },
        //     ),
        //     DataV2 {
        //         name: token_name,
        //         symbol: token_symbol,
        //         uri: token_uri,
        //         seller_fee_basis_points: 0,
        //         creators: None,
        //         collection: None,
        //         uses: None,
        //     },
        //     false, // Is mutable
        //     true,  // Update authority is signer
        //     None,  // Collection details
        // )?;

        msg!("Token created successfully.");

        Ok(())
    }



    // pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    //     msg!("Minting tokens to associated token account...");
    //     msg!("Mint: {}", &ctx.accounts.mint_account.key());
    //     msg!(
    //         "Token Address: {}",
    //         &ctx.accounts.associated_token_account.key()
    //     );

    //     // Invoke the mint_to instruction on the token program
    //     mint_to(
    //         CpiContext::new(
    //             ctx.accounts.token_program.to_account_info(),
    //             MintTo {
    //                 mint: ctx.accounts.mint_account.to_account_info(),
    //                 to: ctx.accounts.associated_token_account.to_account_info(),
    //                 authority: ctx.accounts.mint_authority.to_account_info(),
    //             },
    //         ),
    //         amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32), // Mint tokens, adjust for decimals
    //     )?;

    //     msg!("Token minted successfully.");

    //     Ok(())
    // }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>,
    /// CHECK: Validate address by deriving pda
    // #[account(
    //     mut,
    //     seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
    //     bump,
    //     seeds::program = token_metadata_program.key(),
    // )]
    // pub metadata_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// #[derive(Accounts)]
// pub struct MintToken<'info> {
//     #[account(mut)]
//     pub mint_authority: Signer<'info>,

//     pub recipient: SystemAccount<'info>,
//     #[account(mut)]
//     pub mint_account: Account<'info, Mint>,
//     #[account(
//         init_if_needed,
//         payer = mint_authority,
//         associated_token::mint = mint_account,
//         associated_token::authority = recipient,
//     )]
//     pub associated_token_account: Account<'info, TokenAccount>,

//     pub token_program: Program<'info, Token>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
//     pub system_program: Program<'info, System>,
// }