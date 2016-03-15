
var SELECT_CONTAINER = '.select-resource',
    SELECT_CONTAINER_CSS = 'select-resource', ASSOCIATION_TYPE = 'reference', ASSOCIATION_DEST_TYPE  = 'file';

$(document).on('focus', "input[name='fileDetails_fileReference']", function() {
    jQuery("input[name='fileDetails_fileReference']").addClass('.select-resource');
    var assetType = getAssetType();
    var id = getCurrentAssetId();
    //Make the API call here
    SELECT_CONTAINER = $(this);
    loadAssociationTargets(assetType, ASSOCIATION_TYPE, id , this.value);
});


$(document).ready(function(){
    $(SELECT_CONTAINER).select2({
        dropdownCssClass: SELECT_CONTAINER_CSS,
        containerCssClass: SELECT_CONTAINER_CSS
    });
});

    var SELECT_ENTRY_TEMPLATE = "" +
        "<div class='item' data-uuid='{{uuid}}' data-type='{{shortName}}' data-prev-uuid={{current_association}}>" +
        "<div class='text'>" +
        "   <div class='resource-name' data-resource-name='{{text}}'>{{text}}</div>" +
        "   <div class='resource-version' data-resource-version='{{version}}'>{{version}}</div>" +
        "</div>" +
        " <div class='icon'>" +
        "     <i class='fw fw-{{iconClass}}'></i>" +
        " </div>" +
        "</div>" +
        "";
    var ADD_ASSOCIATION_BUTTON_ID = '#editAssetButton';

$(ADD_ASSOCIATION_BUTTON_ID).on('click',function(){
    $('.select2-selection__rendered .item').each(function(){
        var data = {};
        var targetDetails = {};
        targetDetails = this.dataset;
        var fromAssetId = getCurrentAssetId();
        data.sourceUUID = fromAssetId;
        data.destUUID = targetDetails.uuid;
        data.sourceType = getAssetType();
        data.destType = targetDetails.type;
        data.associationType = ASSOCIATION_TYPE;
        var prev_file = targetDetails.prevUuid;

        if(prev_file != data.destUUID){
            var data1 = {};
            data1.destType = ASSOCIATION_DEST_TYPE;
            data1.destUUID = prev_file;
            data1.sourceUUID = fromAssetId;
            data1.sourceType = getAssetType();
            data1.associationType = ASSOCIATION_TYPE;
            invokeRemoveAssociationAPI(data1);
        }
        invokeAssociationAPI(data);

    });
});
$(document).on('click', ".js-remove-row", function() {
    var assetType = getAssetType();
    var id = getCurrentAssetId();
    //Make the API call here
    SELECT_CONTAINER = $(this);
    var data = {};
    var fromAssetId = getCurrentAssetId();
    data.destType = ASSOCIATION_DEST_TYPE;
    data.sourceUUID = fromAssetId;
    data.destUUID = $(this).parent().parent().find('#fileDetails_fileReference').attr('value');
    data.sourceType = assetType;
    data.associationType = ASSOCIATION_TYPE;
    console.log(data);
    invokeRemoveAssociationAPI(data);
});


    var associatableURL = function(assetType, associationType, id) {
        return caramel.context + '/apis/association/' + assetType + "/" + associationType + "/" + id;
    };
    var associateURL = function(){
        return caramel.context+'/apis/association';
    };

    var removeAssociationURL = function(){
        return caramel.context+'/apis/association/remove';
    };
    var getAssetType = function() {
        return store.publisher.type;
    };
    var getCurrentAssetId = function(){

        console.log(store);
        return store.publisher.assetId;
    };
    var loadAssociationTargets = function(assetType, associationType, id, current_association) {
        var promise = $.ajax({
            url: associatableURL(assetType, associationType, id)
        });
        promise.done(function(data) {
            renderSelect2Box(data, current_association);
            if($(SELECT_CONTAINER + ' option').length !== 0){
                $(ADD_ASSOCIATION_BUTTON_ID).css('display', 'inline-block');
            }
            else {
                $(ADD_ASSOCIATION_BUTTON_ID).hide();
            }
        });
        promise.fail(function() {
            //Do the error handling here
        });
    };
    var associationData = function(element) {
        return $(element).data();
    };
    var template = function(data) {
        var ptr = Handlebars.compile(SELECT_ENTRY_TEMPLATE);
        return ptr(data);
    };
//    var getTargetAssociation= function(item){
//        //console.log($(item).find('.select2-selection__rendered .item'));
//        return $(item).find('.select2-selection__rendered .item').data();
//    };
    var invokeAssociationAPI = function(data){
        $.ajax({
            url: associateURL(),
            data: JSON.stringify(data),
            type: 'POST',
            contentType: 'application/json',
            success: function () {

            },
            error: function () {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_DANGER,
                    title: 'Error!',
                    message: '<div><i class="fa fa-warning"></i> Error occurred while adding association</div>',
                    buttons: [{
                        label: 'Close',
                        action: function (dialogItself) {
                            dialogItself.close();
                        }

                    }]

                });
            }
        });

    };

    var invokeRemoveAssociationAPI = function (data) {
        $.ajax({
            url: removeAssociationURL(),
            data: JSON.stringify(data),
            type: 'DELETE',
            contentType: 'application/json',
            success: function () {

            },
            error: function () {

            }
        });
    };

    var init = function() {
        $('#association-type-container > li').each(function() {
            $(this).on('click', function() {

                $('#step2').removeClass('disabled-area');
                $('#step2 select').attr('disabled', false);

                $('#association-type-container > li > a').removeClass('selected, disabled');

                var meta = associationData(this);
                var assetType = getAssetType();
                var id = getCurrentAssetId();
                if (!meta.associationType) {
                    throw 'Unable to locate the association type for the selected association';
                }
                //Make the API call here
                loadAssociationTargets(assetType, meta.associationType, id);

                $('a', this).addClass('selected');
                $(this).siblings('li').find('a').addClass('disabled');

            });
        });

    };
    /**
     * Formats the provided data into a format that can be used
     * with the select2 plugin.The select2 plugin excepts the index
     * and a text value to be provided in the data set (which must be an array)
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    var formatSelect2Data = function(data, current_association) {
        var output = data.results;
        for (var index = 0; index < output.length; index++) {
            output[index].id = output[index].uuid;
            output[index].current_association = current_association;
        }
        return data;
    };

var fileSelected = function(e){
    var fileContainer = e.currentTarget;
    console.log(fileContainer);
    var assetType = ASSOCIATION_DEST_TYPE;
    var assetId = e.params.data.uuid;
    console.log(e);
    var path = caramel.url('/apis/assets/' + assetId + '?type=' + assetType);
    $.ajax({
        url : path,
        type : 'GET',
        success : function(response) {
            var file = response;
            var row = $(fileContainer.parentElement.parentElement);
            row.find('#fileDetails_fileName').val(file.attributes.overview_name);
            row.find('#fileDetails_seqNo').val(file.attributes.fileDetails_seqNo);
            row.find('#fileDetails_serverSystem').val(file.attributes.fileDetails_serverSystem);
            row.find('#fileDetails_triggerJobname').val(file.attributes.fileDetails_triggerJobname);row.find('#fileDetails_seqNo').val(file.attributes.fileDetails_seqNo);
            row.find('#fileDetails_environment').val(file.attributes.fileDetails_environment);
            row.find('#fileDetails_disposition').val(file.attributes.fileDetails_disposition);
            row.find('#fileDetails_encryption').val(file.attributes.fileDetails_encryption);
            row.find('#fileDetails_direction').val(file.attributes.fileDetails_direction);

        },
        error : function() {
            console.log(err);
        }
    });
}
    var  renderSelect2Box = function(data, current_association) {
        data = formatSelect2Data(data, current_association);
        $(SELECT_CONTAINER).html('');
        $(SELECT_CONTAINER).select2({
            placeholder: 'Select File',
            data: data.results,
            multiple: false,
            width: "100%",
            templateResult: function(result) {
                return template(result)
            },
            templateSelection: function(result) {
                return template(result)
            },
            dropdownCssClass: SELECT_CONTAINER_CSS,
            containerCssClass: SELECT_CONTAINER_CSS,
            escapeMarkup: function(m) {
                return m;
            }
        });
        $(SELECT_CONTAINER).on('select2:select', fileSelected);

    };
