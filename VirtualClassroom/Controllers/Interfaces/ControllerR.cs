using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers.Interfaces
{
    public class ControllerR : Controller
    {
        protected ActionResult responseError(string errorMessage)
        {
            DataResponse<object> response = new DataResponse<object>();

            response.status = VC.RESPONSE_ERROR;
            response.message = errorMessage;

            return Json(response, JsonRequestBehavior.AllowGet);
        }
        protected ActionResult responseSuccess<T>(T data)
        {
            DataResponse<T> response = new DataResponse<T>();

            response.status = VC.RESPONSE_SUCCESS;
            response.data = data;

            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}
