# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
import grpc

import uid_management_pb2 as uid__management__pb2


class UidManagementStub(object):
  # missing associated documentation comment in .proto file
  pass

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.GetUid = channel.unary_unary(
        '/uidmanagement.UidManagement/GetUid',
        request_serializer=uid__management__pb2.IpAddress.SerializeToString,
        response_deserializer=uid__management__pb2.Uid.FromString,
        )
    self.TransferCompleted = channel.unary_unary(
        '/uidmanagement.UidManagement/TransferCompleted',
        request_serializer=uid__management__pb2.Id.SerializeToString,
        response_deserializer=uid__management__pb2.Status.FromString,
        )


class UidManagementServicer(object):
  # missing associated documentation comment in .proto file
  pass

  def GetUid(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')

  def TransferCompleted(self, request, context):
    # missing associated documentation comment in .proto file
    pass
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_UidManagementServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'GetUid': grpc.unary_unary_rpc_method_handler(
          servicer.GetUid,
          request_deserializer=uid__management__pb2.IpAddress.FromString,
          response_serializer=uid__management__pb2.Uid.SerializeToString,
      ),
      'TransferCompleted': grpc.unary_unary_rpc_method_handler(
          servicer.TransferCompleted,
          request_deserializer=uid__management__pb2.Id.FromString,
          response_serializer=uid__management__pb2.Status.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'uidmanagement.UidManagement', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))
