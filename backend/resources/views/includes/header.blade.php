    <!-- <div class="div_loading">
        <img src="/assets/images/load_image.webp" />
    </div> -->
    <input type="text" id="copyfoo" value="" style="display:none;" />
    <div class="div_loading">
        <div>
            <img src="/assets/images/loading.gif" />
            <div class="loading_title"></div>
        </div>
    </div>

    <div class="dlg_photo">
        <img src="" />
        <i class="fa fa-times dlg_photo_close"></i>
    </div>

    <div class="dlg" id='dlg_confirm'>
        <div class="dlg_cont tcenter">
            <i class="fa fa-question-circle mt10" style="color:#004494;font-size: 72px;"></i>
            <div class="confirm_message"></div>
            <div class="dbuttons1 flex flex_jspace">
                <div class="bt bt_white bt_ccancel">Cancel</div>
                <div class="bt bt_cconfirm">Ok</div>
            </div>
        </div>
    </div>

    <div class="dlg" id='dlg_error'>
        <div class="dlg_cont tcenter">
            <i class="fa fa-exclamation-triangle mt10" style="color:#ff4e4e;font-size: 72px;"></i>
            <div class="error_message"></div>
            <div class="dbuttons1 flex flex_jcenter">
                <div class="bt bt_eok">Ok</div>
            </div>
        </div>
    </div>

    <div class="dlg" id='dlg_success'>
        <div class="dlg_cont tcenter">
            <i class="fa fa-check-circle-o mt10" style="color:#00c4ee;font-size: 72px;"></i>
            <div class="success_message"></div>
            <div class="dbuttons1 flex flex_jcenter">
                <div class="bt bt_eok">Ok</div>
            </div>
        </div>
    </div>

    <div class="dlg" id='dlg_change'>
        <div class="dlg_cont tcenter" style="min-width: 320px;">
            <h3>Change Password</h3>
            <div class="d_input">
                <label>Current password</label>
                <input type="text" class="form-control f_input" id="old_password" placeholder="*******">
            </div>
            <div class="d_input">
                <label>New password</label>
                <input type="password" class="form-control f_input" id="newpassword" placeholder="*******">
            </div>
            <div class="d_input">
                <label>Confirm password</label>
                <input type="password" class="form-control f_input" id="newpassword1" placeholder="*******">
            </div>
            <div class="error"></div>
            <div class="dbuttons1 flex flex_jspace">
                <div class="bt bt_white bt_ccancel">Cancel</div>
                <div class="bt bt_cchange">Change</div>
            </div>
        </div>
    </div>

    <div class="toast"><div></div></div>
    
    <div class="top_menu">
        
    </div>